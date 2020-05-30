const crypto = require('crypto');

function genToken() {
    return crypto.createHash('sha1').update(`${Date.now()}:${Math.random() * 1000}`).digest().toString('hex');
}

function removeToken() {
    let t = Date.now();
    for(let token in Token.tokens) {
        if(t - Token.tokens[token].timestamp > 60 * 60 * 1000) {
            delete Token.tokens[token];
        }
    }
    for(let it in Token.forceMap) {
        if(t - Token.forceMap[it] > 60 * 60 * 1000) {
            delete Token.forceMap[it];
        }
    }
    setTimeout(() => removeToken(), 60 * 60 * 1000);
}

class Token {
    static tokens = {};
    static forceMap = {};
    static genToken(t) {
        let token = genToken();
        Token.tokens[token] = {
            userName: t,
            timestamp: Date.now()
        };
        return token;
    }
    static hadForceToken(token) {
        if(Token.forceMap[token]) {
            delete Token.forceMap[token];
            return true;
        }
        return false;
    }
    static updateByUserName(userName) {
        let token = Token.getTokenByUserName(userName);
        if(token) {
            Token.forceMap[token] = Date.now();
            delete Token.tokens[token];
        }
    }
    static hadUserName(userName) {
        for(let it in Token.tokens) {
            if(Token.tokens[it].userName === userName) {
                return true;
            }
        }
        return false;
    }
    static getTokenByUserName(userName) {
        for(let it in Token.tokens) {
            if(Token.tokens[it].userName === userName) {
                return it;
            }
        }
        return false;
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

removeToken();

module.exports = Token;