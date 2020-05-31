const query = require('./sql');
const request = require('./request');

async function search(key, start, size) {
    let sql = `select sql_calc_found_rows * from s_title where ${key} order by create_time desc limit ${start},${size}`;
    let data = await query(sql);
    if(data.errCode) return false;
    let ob = {list: data};
    sql = `select found_rows() total`;
    data = await query(sql);
    if(data.errCode) return false;
    ob.total = data[0].total;
    return ob;
}

async function list(start, size) {
    let sql = `select sql_calc_found_rows * from s_title order by create_time desc limit ${start},${size}`;
    let data = await query(sql);
    if(data.errCode) return false;
    let ob = {list: data};
    sql = `select found_rows() total`;
    data = await query(sql);
    if(data.errCode) return false;
    ob.total = data[0].total;
    return ob;
}

async function latest() {
    let sql = `select * from s_title order by create_time desc limit 0, 100`;
    let data = await query(sql);
    if(data.errCode) return false;
    return {list: data};
}

async function getUser(user) {
    let sql = `select * from s_user where name='${user}'`;
    let data = await query(sql);
    if(data.errCode || !data.length) return false;
    return {name: data[0].name, pwd: data[0].pwd};
}

async function del(id) {
    id = id.split(',').map(d => `'${d}'`).join();
    let sql = `delete from s_title where id in (${id})`;
    let data = await query(sql);
    if(data.errCode) return false;
    return true;
}

async function update(id, encoding) {
    let sql = `select host from s_title where id = '${id}'`;
    let data = await query(sql);
    if(data.errCode) return false;
    data = await request(data[0].host, encoding);
    if(!data) return false;
    let title = data;
    sql = `update s_title set title = '${data}' where id = '${id}'`;
    data = await query(sql);
    if(data.errCode) return false;
    return {title};
}

module.exports = {
    search,
    latest,
    getUser,
    list,
    update,
    del
};