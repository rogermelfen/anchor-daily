/**
 * build-blog.js
 * Leser blog-data/posts/*.json og bygger statiske HTML-sider i docs/blog/,
 * inkludert en oppdatert docs/blog/index.html. Kjøres etter generate-post.js
 * og av GitHub Actions ved hver kjøring.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'blog-data', 'posts');
const BLOG_DIR = path.join(ROOT, 'docs', 'blog');
const DOMAIN = 'https://anchor-daily.com';

// Eksisterende, manuelt skrevne innlegg som ikke styres av JSON-systemet.
// Holdes som statiske kort i indeksen; selve HTML-filene røres ikke.
const LEGACY_POSTS = [
  {
    slug: 'short-daily-devotional-for-today',
    tag: 'Daily Devotional',
    title: 'Short Daily Devotional for Today — 2 Minutes That Change Everything',
    cardDescription: "You don't need an hour or a perfect morning. Two minutes of grounded Scripture-based reflection changes what you bring to the rest of the day.",
    date: '2026-06-01',
    readTime: '4 min read'
  },
  {
    slug: 'daily-devotional-for-anxiety',
    tag: 'Stress &amp; Anxiety',
    title: 'Short Daily Devotional for Anxiety: Finding Peace Before the Day Begins',
    cardDescription: "Most of us start the day the same way: alarm, phone, scroll. Here's what two minutes of stillness can actually change — and why it works.",
    date: '2026-06-01',
    readTime: '4 min read'
  },
  {
    slug: 'christian-devotional-app',
    tag: 'Getting Started',
    title: 'How to Choose a Christian Devotional App (And Why Most Fall Short)',
    cardDescription: "Not all devotional apps are the same. Here's what to look for — and what to avoid — when choosing one that will actually last.",
    date: '2026-06-01',
    readTime: '4 min read'
  },
  {
    slug: 'bible-guidance-for-difficult-decisions',
    tag: 'Difficult Decisions',
    title: 'Daily Bible Devotions: How a Small Habit Builds Clarity for Hard Decisions',
    cardDescription: "Big decisions feel paralyzing. A daily practice of Scripture-based reflection won't give you a map — but it will give you a compass.",
    date: '2026-06-01',
    readTime: '4 min read'
  }
];

function monthYear(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function loadGeneratedPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')));
}

function postPageHtml(post, relatedLinks) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${post.title}</title>
  <meta name="description" content="${post.metaDescription}" />
  <link rel="canonical" href="${DOMAIN}/blog/${post.slug}.html" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.metaDescription}" />
  <meta property="og:url" content="${DOMAIN}/blog/${post.slug}.html" />
  <meta property="og:site_name" content="Anchor Daily" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.metaDescription}",
    "author": { "@type": "Organization", "name": "Anchor Daily" },
    "publisher": { "@type": "Organization", "name": "Anchor Daily", "url": "${DOMAIN}" },
    "datePublished": "${post.date}",
    "url": "${DOMAIN}/blog/${post.slug}.html"
  }
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #7C9A8E; --primary-dark: #5a7a6e; --accent: #D4A574;
      --bg: #F5F0EB; --surface: #FFFFFF; --text: #2d2d2d;
      --text-secondary: #666; --text-muted: #999;
    }
    body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background: var(--bg); border-bottom: 1px solid rgba(0,0,0,0.06); }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.1rem; color: var(--text); text-decoration: none; }
    .logo-icon { width: 36px; height: 36px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-icon svg { width: 20px; height: 20px; fill: white; }
    .nav-cta { background: var(--primary); color: white; padding: 10px 22px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .article { max-width: 680px; margin: 0 auto; padding: 60px 24px 80px; }
    .article-tag { font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
    h1 { font-size: clamp(1.7rem, 4vw, 2.2rem); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
    .article-meta { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.08); }
    .article p { font-size: 1.05rem; color: var(--text-secondary); line-height: 1.8; margin-bottom: 22px; }
    .article h2 { font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 36px 0 14px; }
    .article strong { color: var(--text); }
    blockquote { border-left: 3px solid var(--primary); padding: 14px 20px; background: rgba(124,154,142,0.07); border-radius: 0 10px 10px 0; margin: 28px 0; font-style: italic; color: var(--text-secondary); }
    .cta-box { background: var(--primary); color: white; border-radius: 20px; padding: 36px; text-align: center; margin-top: 52px; }
    .cta-box h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 10px; }
    .cta-box p { opacity: 0.9; font-size: 0.95rem; margin-bottom: 22px; color: white; }
    .cta-btn { display: inline-block; background: white; color: var(--primary); padding: 14px 32px; border-radius: 100px; font-weight: 700; text-decoration: none; font-size: 0.95rem; }
    .cta-note { margin-top: 12px; font-size: 0.8rem; opacity: 0.75; }
    .related { margin-top: 60px; padding-top: 40px; border-top: 1px solid rgba(0,0,0,0.08); }
    .related h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
    .related-links { display: flex; flex-direction: column; gap: 10px; }
    .related-links a { color: var(--primary); text-decoration: none; font-size: 0.95rem; font-weight: 500; }
    .related-links a:hover { text-decoration: underline; }
    footer { text-align: center; padding: 40px 24px; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid rgba(0,0,0,0.06); }
    footer a { color: var(--text-muted); text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <nav>
    <a class="logo" href="/">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.61 1.41 4.88 3.5 6.15V17h7v-1.85C17.59 13.88 19 11.61 19 9c0-3.87-3.13-7-7-7zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
      </div>
      Anchor Daily
    </a>
    <a class="nav-cta" href="/#download">Download Free</a>
  </nav>

  <article class="article">
    <div class="article-tag">${post.tag}</div>
    <h1>${post.title}</h1>
    <div class="article-meta">${monthYear(post.date)} · ${post.readTime} · <a href="/blog/" style="color:var(--text-muted);">All articles</a></div>

${post.bodyHtml}
    <div class="cta-box">
      <h3>${post.ctaText}</h3>
      <p>Anchor Daily delivers one short, Scripture-based reflection every morning, tailored to stress, anxiety, and the real challenges you face. No credit card required.</p>
      <a class="cta-btn" href="/#download">${post.ctaButton}</a>
      <div class="cta-note">${post.ctaNote}</div>
    </div>

    <div class="related">
      <h3>More from the blog</h3>
      <div class="related-links">
${relatedLinks.map(r => `        <a href="/blog/${r.slug}.html">${r.title}</a>`).join('\n')}
      </div>
    </div>
  </article>

  <footer>
    <a href="/">Home</a>
    <a href="/blog/">Blog</a>
    <a href="/privacy-policy.html">Privacy Policy</a>
    <a href="/terms-of-service.html">Terms of Service</a>
    <p style="margin-top:16px;">© 2026 Anchor Daily. All rights reserved.</p>
  </footer>
</body>
</html>
`;
}

function indexHtml(allPosts) {
  const cards = allPosts.map(p => `
      <a class="post-card" href="/blog/${p.slug}.html">
        <div class="post-tag">${p.tag}</div>
        <h2>${p.title}</h2>
        <p>${p.cardDescription}</p>
        <div class="post-meta">${monthYear(p.date)} · ${p.readTime}</div>
      </a>
`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog — Anchor Daily | Christian Devotional Insights</title>
  <meta name="description" content="Practical Christian devotional articles on anxiety, decision-making, and relationships. Faith for your everyday life." />
  <link rel="canonical" href="${DOMAIN}/blog/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Blog — Anchor Daily | Christian Devotional Insights" />
  <meta property="og:description" content="Practical Christian devotional articles on anxiety, decision-making, and relationships. Faith for your everyday life." />
  <meta property="og:url" content="${DOMAIN}/blog/" />
  <meta property="og:site_name" content="Anchor Daily" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #7C9A8E;
      --primary-dark: #5a7a6e;
      --accent: #D4A574;
      --bg: #F5F0EB;
      --surface: #FFFFFF;
      --text: #2d2d2d;
      --text-secondary: #666;
      --text-muted: #999;
    }
    body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    nav {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 40px; background: var(--bg);
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.1rem; color: var(--text); text-decoration: none; }
    .logo-icon { width: 36px; height: 36px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-icon svg { width: 20px; height: 20px; fill: white; }
    .nav-cta { background: var(--primary); color: white; padding: 10px 22px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .container { max-width: 760px; margin: 0 auto; padding: 60px 24px; }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .subtitle { color: var(--text-secondary); margin-bottom: 48px; font-size: 1.05rem; }
    .post-list { display: flex; flex-direction: column; gap: 24px; }
    .post-card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-decoration: none; color: inherit; display: block; transition: transform 0.15s; }
    .post-card:hover { transform: translateY(-2px); }
    .post-tag { font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .post-card h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
    .post-card p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.65; }
    .post-meta { margin-top: 14px; font-size: 0.8rem; color: var(--text-muted); }
    footer { text-align: center; padding: 40px 24px; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid rgba(0,0,0,0.06); }
    footer a { color: var(--text-muted); text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <nav>
    <a class="logo" href="/">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.61 1.41 4.88 3.5 6.15V17h7v-1.85C17.59 13.88 19 11.61 19 9c0-3.87-3.13-7-7-7zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
      </div>
      Anchor Daily
    </a>
    <a class="nav-cta" href="/#download">Download Free</a>
  </nav>

  <div class="container">
    <h1>Blog</h1>
    <p class="subtitle">Practical faith for the challenges you face every day.</p>

    <div class="post-list">
${cards}
    </div>
  </div>

  <footer>
    <a href="/">Home</a>
    <a href="/privacy-policy.html">Privacy Policy</a>
    <a href="/terms-of-service.html">Terms of Service</a>
    <a href="mailto:kontakt@skribleriforetaket.no">Contact</a>
    <p style="margin-top:16px;">© 2026 Anchor Daily. All rights reserved.</p>
  </footer>
</body>
</html>
`;
}

function main() {
  const generated = loadGeneratedPosts();
  const allPosts = [...LEGACY_POSTS, ...generated].sort((a, b) => b.date.localeCompare(a.date));

  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

  generated.forEach(post => {
    const related = allPosts.filter(p => p.slug !== post.slug).slice(0, 2);
    const html = postPageHtml(post, related);
    fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), html, 'utf8');
    console.log(`✅ Bygget docs/blog/${post.slug}.html`);
  });

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHtml(allPosts), 'utf8');
  console.log(`✅ Bygget docs/blog/index.html med ${allPosts.length} innlegg.`);
}

main();
