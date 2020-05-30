const crypto = require('crypto');

function genToken() {
    return crypto.createHash('sha1').update(`${Date.now()}:${Math.random() * 1000}`).digest().toString('hex');
}

class Token {
    static tokens = {};
    static genToken(t) {
        let token = genToken();
        Token.tokens[token] = {
            userName: t,
            timestamp: Date.now()
        };
        return token;
    }
    static needChange(token) {
        let o = Token.tokens[token];
        let n = Date.now();
        return o && n > 30 * 60 * 1000 && n < 60 * 60 * 1000;
    }
    static changeToken(token) {
        let o = Token.tokens[token], t;
        if(o) {
            t = genToken();
            Token.tokens[t] = {
                userName: o.userName,
                timestamp: Date.now()
            };
            delete Token.tokens[token];
            return t;
        }
        return false;
    }
    static checkToken(token) {
        let o = Token.tokens[token];
        if(!o) return false;
        if(Date.now() - o.timestamp > 60 * 60 * 1000) {
            delete Token.tokens[token];
            return false;
        }
        return true;
    }
    static genPwd(pwd) {
        return crypto.createHash('sha1').update(pwd).digest().toString('hex');
    }
    static getUserName(token) {
        return Token.tokens[token].userName;
    }
}

module.exports = Token;