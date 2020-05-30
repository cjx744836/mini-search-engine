const express = require('express');
const app = express();
const path = require('path');
const router = require('./router.build');
const controller = require('./controller');
const APP = 'mini-search-engine';
const utils = require('./utils');
const cookieParser = require('cookie-parser');
const bodyPraser = require('body-parser');
const Token = require('./token');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyPraser.json());
app.use((req, res, next) => {
   res.set('content-type', 'text/html;charset=utf-8');
   if(req.cookies.token && Token.needChange(req.cookies.token)) {
       let tk = Token.changeToken(req.cookies.token);
       tk && res.cookie('token', tk, {maxAge: 60 * 60 * 1000});
   }
   next();
});

app.get('/', (req, res) => {
    router.index(req, res, {title: APP});
});

app.get('/search', async (req, res) => {
    if(!req.query.key) return res.redirect('/');
    let size = 20;
    let pageParam = utils.genPageParam(req.query.key, req.query.page, size);
    let data = await controller.search(pageParam.key, pageParam.start, size);
    if(!data) return res.redirect('/');
    if(!data.total && pageParam.page > 1) return res.redirect(`/search?key=${pageParam.value}`);
    let options = {
        data: {
            list: data.list,
            total: data.total,
            page: pageParam.page,
            value: pageParam.value
        },
        title: `${pageParam.value} - ${APP}`
    };
    router.search(req, res, options);
});

app.get('/latest', async (req, res) => {
    let data = await controller.latest();
    if(!data) return res.redirect('/');
    router.latest(req, res, {title: `最新100 - ${APP}`, data: {list: data.list}});
});

app.get('/login', (req, res) => {
   if(Token.checkToken(req.cookies.token)) return res.redirect('/manager');
   router.login(req, res, {title: `登录 - ${APP}`});
});

app.get('/manager', (req, res) => {
    if(!Token.checkToken(req.cookies.token)) return res.redirect('/login');
    router.manager(req, res, {title: `管理 - ${APP}`});
});

app.post('/del', async (req, res) => {
    if(!Token.checkToken(req.cookies.token) || !req.body.id) return res.send({code: 1002, err: '非法操作'});
    let data = await controller.del(req.body.id);
    if(!data) return res.send({code: 1002, err: '删除失败'});
    res.send({code: 0});
});

app.post('/submit', async (req, res) => {
   if(req.body.name && req.body.pwd) {
       let data = await controller.getUser(req.body.name);
       if(!data) return res.send({code: 1000, err: '用户不存在'});
       if(Token.genPwd(req.body.pwd) !== data.pwd) return res.send({code: 1000, err: '密码错误'});
       res.cookie('token', Token.genToken(req.body.name), {maxAge: 60 * 60 * 1000});
       res.send({code: 0});
   } else {
       res.send({code: 1000, err: '参数错误'});
   }
});

app.post('/list', async (req, res) => {
    if(!Token.checkToken(req.cookies.token)) return res.send({code: 1001, err: '未登录'});
    let size = 20;
    let pageParam = utils.genPageParam(req.body.key, req.body.page, size);
    let data;
    if(req.body.key) {
        data = await controller.search(pageParam.key, pageParam.start, size);
    } else {
        data = await controller.list(pageParam.start, size);
    }
    if(!data) return res.send({code: 1001, err: '数据获取失败'});
    res.send({code: 0, total: data.total, list: data.list});
});

app.get('*', (req, res) => {
   res.redirect('/');
});


module.exports = function() {
    return app;
};