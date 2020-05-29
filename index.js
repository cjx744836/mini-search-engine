const app = require('./src/server/index')();
const Spider = require('./src/spider/index');
const query = require('./src/server/sql');
const port = 5558;
const spider = new Spider();
spider.on('data', data => {
    let sql = `insert into s_title(id,title,host) value('${data.id}','${data.title}','${data.host}')`;
   query(sql);
});
app.listen(port);
