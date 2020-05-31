import Vue from 'vue/dist/vue.esm.js';
import request from './request';
import utils from './utils';
import '@/server/components/pager';
import '@/server/components/message';
import '@/server/components/encoding';

new Vue({
    el: '#app',
    data: {
        list: [],
        sels: {},
        page: 1,
        key: '',
        reg: '',
        last: 0,
        total: 0,
        id: '',
        m_select_all: false,
        visible: false
    },
    methods: {
        formatTime(k) {
            return utils.formatTime(k);
        },
        getSels() {
            return Object.keys(this.sels);
        },
        addSel(id, e) {
            if(this.sels[id]) delete this.sels[id];
            else this.sels[id] = 1;
        },
        delBantch() {
            if(this.getSels().length === 0) return alert('请先选择');
            if(confirm('确定删除')) {
                request('/del', 'post', {id: this.getSels().join()}).then(res => {
                    this.sels = {};
                    this.getList();
                    this.$message('删除成功')
                })
            }
        },
        selectAll() {
            this.m_select_all = !this.m_select_all;
            if(this.m_select_all) {
                this.list.map(d => this.$set(this.sels, d.id, 1));
            } else {
                this.list.map(d => this.$delete(this.sels, d.id));
            }
        },
        filterKeyword(k) {
            if(this.reg) return k.replace(this.reg, '<span>$1</span>');
            return k;
        },
        del(id) {
            if(confirm('确定删除')) {
                request('/del', 'post', {id}).then(res => {
                    delete this.sels[id];
                    this.getList();
                    this.$message('删除成功')
                })
            }
        },
        confirm(encoding) {
            request('/update', 'post', {id: this.id, encoding}).then(res => {
                for(let it of this.list) {
                    if(it.id === this.id) {
                        it.title = res.title;
                        this.$message('更新成功');
                        break;
                    }
                }
            })
        },
        update(id) {
            this.visible = true;
            this.id = id;
        },
        search() {
            let key = this.key.trim();
            if(key.length) {
                key = key.split(' ').filter(d => d.length).map(d => d.replace(/([\*\?\|\+\[\]\{\}\(\)\^\$\&\#\\\/\.])/,'\\$1')).join('|');
                this.reg = new RegExp(`(${key})`, 'gi');
            } else {
                this.reg = '';
            }
            this.sels = {};
            this.m_select_all = false;
            this.page = 1;
            this.getList();
        },
        getList() {
            request('/list', 'post', {page: this.page, key: this.key.trim()}).then(res => {
                this.list = res.list;
                this.total = res.total;
            })
        }
    },
    updated() {
        this.m_select_all = this.list.every(d => this.sels[d.id]);
    },
    created() {
        this.getList();
    }
})
