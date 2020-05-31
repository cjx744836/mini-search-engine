const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');
const crypto = require('crypto');
const {detectEncoding} = require('char-encoding-detector');
let reqTIMEOUT = 3000;
const resTIMEOUT = 5000;
let rawData = Buffer.alloc(0);
let options = {
    method: 'get',
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        'accept': 'text/html'
    }
};
let adapter, req;

function isHttps(host) {
    return /https/.test(host);
}

function get(options) {
    return new Promise((resolve, reject) => {
        let tid = 0;
        adapter = isHttps(options.cprotocol) ? https : http;
        rawData = Buffer.alloc(0);
        req = adapter.request(options, function(res) {
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
                            let url = new URL(res.headers.location);
                            options.host = url.host;
                            options.path = url.pathname;
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
                if(code === 200) {
                    resId = setTimeout(() => {
                        res.destroy();
                        rawData = undefined;
                        reject(new Error('Response Timeout'));
                    }, resTIMEOUT);
                    let m;
                    res.on('data', chunk => {
                        rawData = Buffer.concat([rawData, chunk], rawData.length + chunk.length);
                    });
                    res.on('end', () => {
                        clearTimeout(resId);
                        resolve({data: rawData});
                        rawData = undefined;
                    });
                    res.on('error', e => {
                        if(res.destroyed) return;
                        reject(e);
                    });
                } else {
                    reject(new Error(`Not Found`));
                }
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

const filterKey = ['出售', '售卖', '来源', '电话', '没有找到', '米表', '私人小站', '域名', '欢迎访问', '欢迎光临', '彩票', '六合彩', '欢迎莅临', '新网', '网贷', '中介', '机构', '敬请期待', 'app', '无法访问', '无法找到', '体彩', '福彩', '商标', '网站已开通', '抱歉', '错误', '报错', '页面不存在', '出错'];

process.on('message', args => {
    if(!args.host) return;
    options.host = args.host;
    get(options).then(res => {
        let title, ob = {};
        title = iconv.decode(res.data, detectEncoding(res.data) || 'gb2312');
        title = title.match(/<title>(.*)<\/title>/i);
        if(title) {
            if(/&#[^;]+;/.test(title[1])) {
                title[1] = decode(title[1]);
            }
            if(!/[\u00ff-\uffff]{3}/.test(title[1]) || filterKey.some(d => title[1].indexOf(d) > -1)) return process({err: 1});
            ob.title = title[1];
            ob.id = genId(args.host);
            ob.host = args.host;
        }
        process.send(ob);
    }).catch(err => {
        process.send({err: 1});
    });
});
