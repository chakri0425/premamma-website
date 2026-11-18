#!/usr/bin/env python3
"""Builds the static pages of the Premamma website from shared header/footer."""
import os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/premamma-site'

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600&family=Noto+Serif+Telugu:wght@400;600&display=swap" rel="stylesheet">')

NAV_LEFT = [('story.html', 'Her Story'), ('book.html', 'The Book'), ('release.html', 'Book Release')]
NAV_RIGHT = [('gallery.html', 'Gallery'), ('reviews.html', 'Reviews'), ('contact.html', 'Contact')]


def links(items, cur):
    return '\n'.join(
        f'<a href="{h}"{" aria-current=\"page\"" if h == cur else ""}>{t}</a>' for h, t in items)


def header(cur, solid=False):
    all_items = [('index.html', 'Home')] + NAV_LEFT + NAV_RIGHT
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="nav">
    <nav class="nav-links" aria-label="Main">
      {links(NAV_LEFT, cur)}
    </nav>
    <a class="brand" href="index.html">Premamma<small>ప్రేమమ్మ</small></a>
    <nav class="nav-links nav-right" aria-label="More">
      {links(NAV_RIGHT, cur)}
      <a class="nav-cta" href="book.html#copies">Get the Book</a>
    </nav>
    <button class="menu-btn" id="menu-open" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
    </button>
  </div>
  <nav class="mobile-menu" id="mobile-menu" aria-label="Menu">
    <button class="menu-btn close" id="menu-close" aria-label="Close menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    {links(all_items, cur)}
  </nav>
</header>'''


FOOTER = '''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="stack" style="gap:18px">
        <p class="display h-l">Write to<br><em>Premamma</em></p>
        <a class="email-link" href="mailto:rspremamma@gmail.com">rspremamma@gmail.com</a>
      </div>
      <div class="btn-row">
        <a class="btn btn-ghost" href="reviews.html">Write a review</a>
        <a class="btn btn-solid" href="contact.html">Send a message</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Premamma · <span class="te">ప్రేమమ్మ</span> · <a href="mailto:rspremamma@gmail.com">rspremamma@gmail.com</a></span>
      <nav aria-label="Footer">
        <a href="index.html">Home</a><a href="story.html">Her Story</a><a href="book.html">The Book</a><a href="release.html">Book Release</a><a href="gallery.html">Gallery</a><a href="reviews.html">Reviews</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a>
      </nav>
    </div>
  </div>
</footer>'''


def page(fname, title, desc, cur, body, solid=False, extra_head=''):
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/cover-small.jpg">
<meta property="og:type" content="website">
<meta name="theme-color" content="#120D08">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="assets/css/style.css">
{extra_head}
</head>
<body>
{header(cur, solid)}
<main id="main">
{body}
</main>
{FOOTER}
<script src="assets/js/site.js" defer></script>
</body>
</html>
'''
    with open(os.path.join(OUT, fname), 'w', encoding='utf-8') as f:
        f.write(html)
    print('wrote', fname)


# import page bodies
sys.path.insert(0, os.path.dirname(__file__))
from pages import PAGES  # noqa: E402

for p in PAGES:
    page(**p)
