const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');
const crypto = require('crypto');
let reqTIMEOUT = 3000;
const resTIMEOUT = 5000;
let options = {
    method: 'get',
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        'accept': 'text/html'
    }
};

function isHttps(host) {
    return /https/.test(host);
}

function get(options) {
    return new Promise((resolve, reject) => {
        let tid = 0;
        let adapter = isHttps(options.cprotocol) ? https : http;
        let rawData = Buffer.alloc(0);
        let req = adapter.request(options, function(res) {
            clearTimeout(tid);
            let resId = 0;
            let code = res.statusCode;
            if(code >= 300 && code < 400) {
                if(res.headers.location) {
                    options.cprotocol = isHttps(res.headers.location) ? 'https' : 'http';
                    options.credirect = options.credirect ? options.credirect + 1 : 1;
                    if(options.credirect > 3) {
                        return reject(new Error(`Redirect Max`));
                    }
                    if(res.headers.location.indexOf('http') > -1) {
                        try {
                            options.host = new URL(res.headers.location).host;
                        } catch(e) {
                            return reject(e);
                        }
                    } else {
                        options.host += res.headers.location;
                    }
                    return get(options).then(res => resolve(res)).catch(err => reject(err));
                } else {
                    return reject(new Error(`Redirect Failed`));
                }
            } else {
                resId = setTimeout(() => {
                    res.destroy();
                    reject(new Error('Response Timeout'));
                }, resTIMEOUT);
                let m;
                res.on('data', chunk => {
                    rawData = Buffer.concat([rawData, chunk], rawData.length + chunk.length);
                });
                res.on('end', () => {
                    clearTimeout(resId);
                    resolve({data: rawData});
                });
                res.on('error', e => {
                    if(res.destroyed) return;
                    reject(e);
                });
            }
        });
        tid = setTimeout(() => {
            req.destroy();
            reject(new Error(`Request Timeout`));
        }, reqTIMEOUT);
        req.on('error', (e) => {
            if(req.destroyed) return;
            reject(e);
        });
        req.end();
    });
}

function genId(s) {
    return crypto.createHash('sha1').update(s).digest().toString('hex');
}

function decode(t) {
    return t.replace(/&#([^;]+);/g, function(a, b) {
        if(/^x/.test(b)) {
            return String.fromCharCode(0 + b);
        }
        return String.fromCharCode(b);
    })
}

function isNeedDecode(data) {
    let m = data.match(/gb2312|gbk|big5|utf-8/i);
    if(m) return m;
    return 0;
}

process.on('message', args => {
    options.host = args.host;
    get(options).then(res => {
        let m = isNeedDecode(res.data.toString());
        if(m) {
            res = {data: iconv.decode(res.data, m)};
        } else {
            res = {data: res.data.toString()};
        }
        let title, ob = {};
        if(res && typeof res.data === 'string') {
            title = res.data.match(/<title>(.*)<\/title>/i);
            if(title) {
                if(/&#[^;]+;/.test(title[1])) {
                    title[1] = decode(title[1]);
                }
                ob.title = title[1];
                ob.id = genId(args.host);
                ob.host = args.host;
            }
        }
        process.send(ob);
    }).catch(err => {
        process.send({err: 1});
    });
});
