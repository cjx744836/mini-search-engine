const {fork} = require('child_process');
const M = 5;
const SF = ['cc', 'net', 'com', 'vip', 'wang', 'com.cn', 'cn', 'tv', 'org', 'top', 'xyz'];
const CHAR = 'abcdefghijklmnopqrstuvwxyz0123456789';
const LETTER = 'abcdefghijklmnopqrstuvwxyz';
const Events = require('events');
const WORDS = ['male', 'female', 'pig', 'rp', 'cb', 'fuck', 'chat', 'cow', 'cc', 'dd', 'dapao', 'cao', 'fun', 'funny', 'sq', 'qs', 'tk', 'rabbit', 'tigger', 'eat', 'tea', 'cj', 'kj', 'lili', 'loli', 'yz', 'fk', 'bg', 'bed', 'baby', 'vv', 'lv', 'ml', 'pic', 'mt', 'meitu', 'mntp', 'mn', 'mm', 'cat', 'god', 'dog', 'se', 'sex', 'sexy', 'girl', 'girls', 'beauty', 'like', 'love', 'pp', 'bb', 'sb', 'man', 'men', 'oo', 'xx', 'xo', 'qq', 'aa', 'tt', 'll', 'pao', 'pipi', 'pi', 'vv', 'zz', 'uu', 'rr', 'ww', 'jj', 'gg', 'gm', 'lo', 'mb', 'hole', 'ass', 'ff', 'ee', 'yy', 'ai', 'av', 'porn', 'movie', 'film', 'blue', 'joke', 'eros', 'rose', 'food', 'fky', 'boy', 'book', 'cook', 'lust', 'gay', 'xxoo', 'ooxx', 'lsj', 'tb'];
//%r: number + letter, %s: letter, %d: number, %c: character, %w: word
const rules = [
        '%s:2',
        '%s:3',
        '%s:4',
        '%s:5',
        '%d:2',
        '%d:3',
        '%d:4',
        '%d:5',
        '%s:2%d:2',
        '%d:2%s:2',
        '%s:3%d:3',
        '%d:3%s:3',
        '%d:2%w:1',
        '%w:1%d:2',
        '%w:1%d:3',
        '%d:3%w:1'
    ];

let rule_fn = [];



function randShuffix() {
    return SF[Math.random() * SF.length | 0];
}

function randWords() {
    return WORDS[Math.random() * WORDS.length | 0];
}

function randLetter() {
    return LETTER[Math.random() * LETTER.length | 0];
}

function randNumber() {
    return Math.random() * 10 | 0;
}

function randChar() {
    return CHAR[Math.random() * CHAR.length | 0];
}

function randRule() {
    return rules[Math.random() * rules.length | 0];
}

function parse(rule) {
    if(rule.length === 0) throw new Error('Invalid rule');
    let c = [], c1, c2, i = 0, l = rule.length, o = {}, s = 0;
    function next() {
        if(i === l) return 'EOF';
        return rule[i];
    }
    while(1) {
        if(i === l) break;
        c1 = rule[i++];
        c2 = next();
        switch(c1) {
            case '%':
                if(!/[cdrsw]/.test(c2)) throw new Error('Invalid rule');
                s = 1;
                break;
            case ':':
                if(c2 === '%' || c2 === 'EOF' || s !== 1) throw new Error('Invalid rule');
                s = 2;
                break;
            default:
                if(s === 1) {
                    if(c2 !== ':') throw new Error('Invalid rule');
                    o.type = c1;
                } else if(s === 2) {
                    if(o.type !== 'c' && isNaN(c1)) throw new Error('Invalid rule');
                    o.value = (o.value || '') + c1;
                    if(c2 === '%' || c2 === 'EOF') {
                        c.push({
                            type: o.type,
                            value: o.value
                        });
                        o = {};
                    }
                } else {
                    throw new Error('Invalid rule');
                }
                break;
        }
    }
    return c;
}

function genRuleFn() {
    let c = rules.map(d => parse(d));
    c.forEach(d => {
       rule_fn.push(function() {
          return genDomain(d);
       });
    });
}

function genDomain(rule) {
    let n, c;
    return rule.map(d => {
       if(d.type === 'c') return d.value;
       n = Number(d.value);
       c = '';
       if(d.type === 's') {
           while(n--) {
               c += randLetter();
           }
       }
       if(d.type === 'r') {
           while(n--) {
               c += randChar();
           }
       }
       if(d.type === 'w') {
           while(n--) {
               c += randWords();
           }
       }
        if(d.type === 'd') {
            while(n--) {
                c += randNumber();
            }
        }
        return c;
    }).join('');
}

function randDomain() {
    let host = 'www.';
    host += rule_fn[Math.random() * rule_fn.length | 0]();
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
        genRuleFn();
        run.call(this, options.max);
    }
}

module.exports = Spider;