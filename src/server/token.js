const crypto = require('crypto');

class Token {
    static tokens = {};
    static genToken(t) {
        let token = crypto.createHash('sha1').update(t).digest().toString('hex');
        Token.tokens[token] = {
            userName: t,
            timestamp: Date.now()
        };
        return token;
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