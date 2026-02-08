const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const url = require('url');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use(express.static('public'));

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

// メインページ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// プロキシエンドポイント
app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('URL parameter is required');
  }
  
  // URLの検証
  try {
    new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid URL');
  }
  
  const proxyBase = `${req.protocol}://${req.get('host')}`;
  
  // リクエストオプション
  const options = {
    url: targetUrl,
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': req.headers['accept-language'] || 'ja,en-US;q=0.9,en;q=0.8',
      'Referer': targetUrl
    },
    encoding: null, // バイナリデータを処理するため
    followRedirect: true,
    maxRedirects: 5
  };
  
  request(options, (error, response, body) => {
    if (error) {
      console.error('Proxy error:', error);
      return res.status(500).send('Error fetching the requested page');
    }
    
    const contentType = response.headers['content-type'] || '';
    
    // HTMLの場合は書き換え
    if (contentType.includes('text/html')) {
      try {
        const html = body.toString('utf-8');
        const rewrittenHtml = rewriteHtml(html, targetUrl, proxyBase);
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(rewrittenHtml);
      } catch (e) {
        console.error('HTML rewrite error:', e);
        res.status(500).send('Error processing HTML');
      }
    } 
    // CSSの場合
    else if (contentType.includes('text/css')) {
      let css = body.toString('utf-8');
      // CSS内のURLを書き換え
      css = css.replace(/url\(['"]?([^'"()]+)['"]?\)/g, (match, urlPath) => {
        const rewritten = rewriteUrl(urlPath, targetUrl, proxyBase);
        return `url('${rewritten}')`;
      });
      res.set('Content-Type', contentType);
      res.send(css);
    }
    // JavaScriptやその他のファイル
    else {
      // そのまま返す
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding' && 
            key.toLowerCase() !== 'transfer-encoding' &&
            key.toLowerCase() !== 'content-security-policy') {
          res.set(key, response.headers[key]);
        }
      });
      res.send(body);
    }
  });
});

// POSTリクエストのプロキシ
app.post('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('URL parameter is required');
  }
  
  const proxyBase = `${req.protocol}://${req.get('host')}`;
  
  const options = {
    url: targetUrl,
    method: 'POST',
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
      'Referer': targetUrl
    },
    body: req.body,
    json: req.headers['content-type']?.includes('application/json'),
    encoding: null,
    followRedirect: true
  };
  
  request(options, (error, response, body) => {
    if (error) {
      return res.status(500).send('Error processing request');
    }
    
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('text/html')) {
      const html = body.toString('utf-8');
      const rewrittenHtml = rewriteHtml(html, targetUrl, proxyBase);
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(rewrittenHtml);
    } else {
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding' && 
            key.toLowerCase() !== 'transfer-encoding') {
          res.set(key, response.headers[key]);
        }
      });
      res.send(body);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
