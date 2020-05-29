const {fork} = require('child_process');
const M = 5;
const SF = ['cc', 'net', 'com', 'vip', 'wang', 'com.cn', 'cn', 'tv', 'org', 'top', 'xyz'];
const CHAR = 'abcdefghijklmnopqrstuvwxyz0123456789';
const Events = require('events');

function rand(m, n) {
    return m + (n - m) * Math.random() | 0;
}

function randShuffix() {
    return SF[Math.random() * SF.length | 0];
}

function randChar() {
    return CHAR[Math.random() * CHAR.length | 0];
}

function randDomain() {
    let m = rand(2, 21);
    let host = 'www.';
    while(m--) {
        host += randChar();
    }
    return host + '.' + randShuffix();
}

function run(max) {
    max = max || M;
    if(isNaN(max)) {
        max = M;
    } else {
        if(Number(max) < 1) {
            max = 1;
        }
    }
    while(max--) {
        child.call(this);
    }
}

function child() {
    let child = fork(__dirname + '/request.js', {windowsHide: true});
    child.on('message', res => {
        if(res.title) {
            this.emit('data', res);
        }
        send();
    });
    send();
    function send() {
        child.send({host: randDomain()});
    }
}

class Spider extends Events {
    constructor(options) {
        super();
        options = options || {};
        run.call(this, options.max);
    }
}

module.exports = Spider;