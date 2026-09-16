#!/usr/bin/env python3
"""
Generates the Spanish site under /es/ from the English pages plus i18n.js.

English is the source of truth: edit the English HTML, then run

    python3 build-es.py

and /es/ is rebuilt. Nothing else needs touching.
"""
import re, os, json, shutil, html as htmlmod

ROOT = os.path.dirname(os.path.abspath(__file__))
PAGES = ['index.html', 'marca.html', 'about.html', 'privacidad.html',
         'login.html', 'pronto.html', '404.html']
BASE = 'https://hadete.com/'


def spanish_dict():
    """Pull DICT.es out of i18n.js without running JavaScript."""
    src = open(os.path.join(ROOT, 'i18n.js'), encoding='utf-8').read()
    start = src.index('es: {', src.index('DICT:'))
    depth, i = 0, src.index('{', start)
    for j in range(i, len(src)):
        if src[j] == '{':
            depth += 1
        elif src[j] == '}':
            depth -= 1
            if depth == 0:
                body = src[i:j + 1]
                break
    body = re.sub(r'/\*.*?\*/', '', body, flags=re.S)
    body = re.sub(r',(\s*})', r'\1', body)
    return json.loads(body)


def translate(page, ES):
    s = open(os.path.join(ROOT, page), encoding='utf-8').read()

    # 1. every translatable node gets its Spanish text baked in
    def txt(m):
        key = m.group('key')
        val = ES.get(key)
        if val is None:
            return m.group(0)
        return m.group('open') + htmlmod.escape(val, quote=False) + m.group('close')

    s = re.sub(
        r'(?P<open><(?P<tag>[a-z0-9]+)[^>]*\sdata-i18n="(?P<key>[^"]+)"[^>]*>)'
        r'(?P<body>.*?)'
        r'(?P<close></(?P=tag)>)',
        txt, s, flags=re.S)

    def raw(m):
        val = ES.get(m.group('key'))
        return m.group(0) if val is None else m.group('open') + val + m.group('close')

    s = re.sub(
        r'(?P<open><(?P<tag>[a-z0-9]+)[^>]*\sdata-i18n-html="(?P<key>[^"]+)"[^>]*>)'
        r'(?P<body>.*?)'
        r'(?P<close></(?P=tag)>)',
        raw, s, flags=re.S)

    # 2. head — done with a parser, not regexes.
    #    The HTML is rewritten by other tools that normalise attribute order,
    #    so <link rel="canonical" href=...> and <link href=... rel="canonical">
    #    both occur. Matching on tag+attribute survives that; regex does not.
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(s, 'html.parser')

    en_url = BASE + ('' if page == 'index.html' else page)
    es_url = BASE + 'es/' + ('' if page == 'index.html' else page)

    soup.find('html')['lang'] = 'es'

    title = ES.get(page + '.title')
    desc = ES.get(page + '.desc')
    if title and soup.title:
        soup.title.string = title

    def meta(attr, value):
        return soup.find('meta', attrs={attr: value})

    if desc and meta('name', 'description'):
        meta('name', 'description')['content'] = desc
    if title and meta('property', 'og:title'):
        meta('property', 'og:title')['content'] = title
    if desc and meta('property', 'og:description'):
        meta('property', 'og:description')['content'] = desc
    if meta('property', 'og:url'):
        meta('property', 'og:url')['content'] = es_url

    if not meta('property', 'og:locale'):
        loc = soup.new_tag('meta'); loc['property'] = 'og:locale'; loc['content'] = 'es_AR'
        soup.head.append(loc)
    else:
        meta('property', 'og:locale')['content'] = 'es_AR'

    canon = soup.find('link', rel='canonical')
    if canon:
        canon['href'] = es_url

    for l in soup.find_all('link', rel='alternate'):
        if l.get('hreflang'):
            l.decompose()
    for lang, href in (('es', es_url), ('en', en_url), ('x-default', en_url)):
        l = soup.new_tag('link'); l['rel'] = 'alternate'; l['hreflang'] = lang; l['href'] = href
        soup.head.append(l)

    s = str(soup)

    # 3. assets and shared files live one level up
    s = re.sub(r'(href|src)="(assets/|style\.css|site\.js|i18n\.js|analytics\.js|favicon|site\.webmanifest|og-image)',
               lambda m: f'{m.group(1)}="../{m.group(2)}', s)
    s = re.sub(r'imagesrcset="([^"]*)"',
               lambda m: 'imagesrcset="' + m.group(1).replace('assets/', '../assets/') + '"', s)
    # (?<!image) matters: without it this rule also matches imagesrcset= and
    # prefixes it a second time, producing ../../assets/
    s = re.sub(r'(?<!image)srcset="([^"]*)"',
               lambda m: 'srcset="' + m.group(1).replace('assets/', '../assets/') + '"', s)

    return s


def main():
    ES = spanish_dict()
    out = os.path.join(ROOT, 'es')
    os.makedirs(out, exist_ok=True)
    for page in PAGES:
        open(os.path.join(out, page), 'w', encoding='utf-8').write(translate(page, ES))
        print('  es/' + page)

    # sitemap covering both languages, with hreflang pairs
    urls = []
    for page in ['index.html', 'marca.html', 'about.html', 'privacidad.html']:
        en = BASE + ('' if page == 'index.html' else page)
        es = BASE + 'es/' + ('' if page == 'index.html' else page)
        pri = '1.0' if page == 'index.html' else ('0.8' if page == 'marca.html' else '0.5')
        for loc, alt_self, alt_other, lang, other in (
                (en, en, es, 'en', 'es'), (es, es, en, 'es', 'en')):
            urls.append(
                f'  <url>\n    <loc>{loc}</loc>\n'
                f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{alt_self}"/>\n'
                f'    <xhtml:link rel="alternate" hreflang="{other}" href="{alt_other}"/>\n'
                f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>\n'
                f'    <priority>{pri}</priority>\n  </url>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(urls) + '\n</urlset>\n')
    print('  sitemap.xml')


if __name__ == '__main__':
    main()
