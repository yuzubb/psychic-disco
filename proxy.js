const fetch = require('node-fetch');
const cheerio = require('cheerio');
const url = require('url');

// URLを書き換える関数
function rewriteUrl(originalUrl, baseUrl, proxyBase) {
  if (!originalUrl) return originalUrl;
  
  // 絶対URLの場合
  if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
    return `${proxyBase}/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  
  // プロトコル相対URL
  if (originalUrl.startsWith('//')) {
    return `${proxyBase}/proxy?url=${encodeURIComponent('https:' + originalUrl)}`;
  }
  
  // 相対URLの場合
  if (originalUrl.startsWith('/')) {
    const parsedBase = url.parse(baseUrl);
    const absoluteUrl = `${parsedBase.protocol}//${parsedBase.host}${originalUrl}`;
    return `${proxyBase}/proxy?url=${encodeURIComponent(absoluteUrl)}`;
  }
  
  // その他の相対URL
  const absoluteUrl = url.resolve(baseUrl, originalUrl);
  return `${proxyBase}/proxy?url=${encodeURIComponent(absoluteUrl)}`;
}

// HTMLを書き換える関数
function rewriteHtml(html, targetUrl, proxyBase) {
  const $ = cheerio.load(html);
  
  // すべてのリンクを書き換え
  $('a').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href) {
      $(elem).attr('href', rewriteUrl(href, targetUrl, proxyBase));
    }
  });
  
  // 画像のsrcを書き換え
  $('img').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src) {
      $(elem).attr('src', rewriteUrl(src, targetUrl, proxyBase));
    }
    const srcset = $(elem).attr('srcset');
    if (srcset) {
      const rewritten = srcset.split(',').map(item => {
        const parts = item.trim().split(' ');
        parts[0] = rewriteUrl(parts[0], targetUrl, proxyBase);
        return parts.join(' ');
      }).join(', ');
      $(elem).attr('srcset', rewritten);
    }
  });
  
  // CSSとJSのリンクを書き換え
  $('link[rel="stylesheet"]').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href) {
      $(elem).attr('href', rewriteUrl(href, targetUrl, proxyBase));
    }
  });
  
  $('script').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src) {
      $(elem).attr('src', rewriteUrl(src, targetUrl, proxyBase));
    }
  });
  
  // フォームのactionを書き換え
  $('form').each((i, elem) => {
    const action = $(elem).attr('action');
    if (action) {
      $(elem).attr('action', rewriteUrl(action, targetUrl, proxyBase));
    }
  });
  
  // iframeのsrcを書き換え
  $('iframe').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src) {
      $(elem).attr('src', rewriteUrl(src, targetUrl, proxyBase));
    }
  });
  
  // Base URLを追加
  if ($('base').length === 0) {
    $('head').prepend(`<base href="${targetUrl}">`);
  }
  
  return $.html();
}

module.exports = async (req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  // URLの検証
  try {
    new URL(targetUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  const proxyBase = `https://${req.headers.host}`;
  
  try {
    // リクエストオプション
    const options = {
      method: req.method,
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': req.headers['accept-language'] || 'ja,en-US;q=0.9,en;q=0.8',
        'Referer': targetUrl
      },
      redirect: 'follow',
      follow: 5
    };

    // POSTの場合はボディを追加
    if (req.method === 'POST' && req.body) {
      options.body = JSON.stringify(req.body);
      options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type') || '';
    
    // HTMLの場合は書き換え
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const rewrittenHtml = rewriteHtml(html, targetUrl, proxyBase);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(rewrittenHtml);
    } 
    // CSSの場合
    else if (contentType.includes('text/css')) {
      let css = await response.text();
      // CSS内のURLを書き換え
      css = css.replace(/url\(['"]?([^'"()]+)['"]?\)/g, (match, urlPath) => {
        const rewritten = rewriteUrl(urlPath, targetUrl, proxyBase);
        return `url('${rewritten}')`;
      });
      res.setHeader('Content-Type', contentType);
      return res.send(css);
    }
    // その他のファイル
    else {
      const buffer = await response.buffer();
      
      // 必要なヘッダーをコピー
      const headersToForward = ['content-type', 'cache-control', 'expires', 'last-modified', 'etag'];
      headersToForward.forEach(header => {
        const value = response.headers.get(header);
        if (value && header !== 'content-encoding' && header !== 'transfer-encoding') {
          res.setHeader(header, value);
        }
      });
      
      return res.send(buffer);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Error fetching the requested page' });
  }
};
