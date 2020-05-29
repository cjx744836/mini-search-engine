const express = require('express');
const app = express();
const path = require('path');
const query = require('./sql');
const router = require('./router');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    router.index(req, res, {
        title: 'mini-search-engine'
    });
});

app.get('/search', (req, res) => {
    if(req.query.key) {
        req.query.key = decodeURIComponent(req.query.key);
        let key = req.query.key.split(' ').filter(d => d.length).map(d => `title like '%${d}%'`).join(' or ');
        let page = isNaN(req.query.page) ? 1 : (Number(req.query.page) || 1);
        let size = 20;
        let start = (page - 1) * size;
        let sql = `select sql_calc_found_rows * from s_title where ${key} order by create_time desc limit ${start},${size}`;
        let options = {data: {}};
        query(sql, (err, results) => {
            if(err) return res.redirect('/');
            options.data.list = results;
            query(`select found_rows() total`, (err, results) => {
               if(err) return res.redirect('/');
               if(!results[0].total && page > 1) return res.redirect(`/search?key=${req.query.key}`);
               options.data.total = results[0].total;
               options.data.page = page;
               options.data.value = req.query.key;
               options.title = req.query.key + ' - mini-search-engine';
               router.search(req, res, options);
            });
        });
    } else {
        res.redirect('/');
    }
});

app.get('/latest', (req, res) => {
   let sql = `select * from s_title order by create_time desc limit 0, 100`;
   query(sql, (err, results) => {
       if(err) return res.redirect('/');
       router.latest(req, res, {title: '最新100 - mini-search-engine', data: {list: results}});
   })
});

app.get('*', (req, res) => {
   res.redirect('/');
});


module.exports = function() {
    return app;
};