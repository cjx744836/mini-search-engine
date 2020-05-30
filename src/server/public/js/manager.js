import Vue from 'vue/dist/vue.esm.js';
import request from './request';
(function() {
    let dlg = Vue.extend({
        template: '<div style="position:fixed;top:10px;left:50%;background:#c00;color:#fff;padding:10px 20px;border-radius:3px;">{{msg}}</div>',
        props: ['msg'],
        mounted() {
            document.body.appendChild(this.$el);
            setTimeout(() => {
                this.$el.remove();
            }, 2000);
        }
    });

    function message(msg) {
        new dlg({propsData: {msg}}).$mount();
    }

    Vue.component('pager', {
        template: `
        <div class="page-container" ref="container">
        <span @click="prev" :class="{disabled:currentPage===1}" ref="prev">&lt;</span>
        <span class="normal" ref="pager">
            <span @click="pageTo(1)" v-if="firstVisble">1</span>
            <span @click="prevPage" v-if="firstVisble">...</span>
            <span v-for="(k,i) in pages" @click="pageTo(k)" :key="i" :class="{active: currentPage===k}">{{k}}</span>
            <span @click="nextPage" v-if="lastVisble">...</span>
            <span @click="pageTo(last)" v-if="lastVisble">{{last}}</span>
        </span>
        <span @click="next" :class="{disabled:currentPage===last}" ref="next">&gt;</span>
        <span class="normal" ref="total">共{{total}}条</span>
        <span class="normal" ref="jumper">
            <span class="normal">前往</span>
            <input type="text" class="number" v-model.number="jumpPage" @change="change">
            <span class="normal">页</span>
        </span>
    </div>`,
        props: {
            pageCount: {
                type: Number,
                default: 7
            },
            pageSize: {
                type: Number,
                required: true
            },
            total: {
                type: Number,
                required: true
            },
            page: {
                type: Number,
                required: true
            },
            layout: {
                type: String,
                default: 'prev,pager,next'
            }
        },
        data() {
            return {
                pages: [],
                jumpPage: this.page,
                psize: this.pageSize,
                currentPage: this.page,
                firstVisble: false,
                lastVisble: false,
                last: 1,
                mid: 0,
                lay: ['prev', 'next', 'pager', 'jumper', 'total']
            }
        },
        watch: {
            pageCount() {
                this.initCount();
                this.initPage();
            },
            pageSize(v) {
                this.psize = v;
                this.initPage();
            },
            page(v) {
                this.jumpPage = v;
                this.currentPage = v;
                this.initPage();
            },
            total() {
                this.initPage();
            }
        },
        created() {
            this.initCount();
            this.initPage();
        },
        mounted() {
            this.lay.forEach(k => {
                this.$refs.container.removeChild(this.$refs[k]);
            });
            this.layout.split(',').forEach(k => {
                if(this.$refs[k]) this.$refs.container.appendChild(this.$refs[k]);
            });
        },
        methods: {
            initCount() {
                if(this.pageCount % 2 === 0) {
                    this.pageCount = this.pageCount + 1;
                }
                this.mid = this.pageCount / 2 | 0;
            },
            change() {
                this.jumpPage = this.jumpPage > this.last ? this.last : this.jumpPage < 1 ? 1 : this.jumpPage;
                this.pageTo(this.jumpPage);
            },
            initPage() {
                this.last = Math.ceil(this.total / this.pageSize);
                if(this.last <= 0) this.last = 1;
                if(this.currentPage > this.last) {
                    this.jumpPage = this.currentPage = this.last;
                } else if(this.currentPage < 1) {
                    this.jumpPage = this.currentPage = 1;
                }
                this.genPages();
            },
            genPages() {
                this.pages = [];
                var start, end, i;
                if(this.last <= this.pageCount) {
                    start = 1;
                    end = this.last;
                } else {
                    if(this.currentPage - this.mid <= 0) {
                        start = 1;
                        end = start + this.pageCount - 1;
                    } else if(this.currentPage + this.mid >= this.last) {
                        end = this.last;
                        start = end - this.pageCount + 1;
                    } else {
                        start = this.currentPage - this.mid;
                        end = this.currentPage + this.mid;
                    }
                }
                this.firstVisble = start > 1;
                this.lastVisble = end < this.last;
                while(start <= end) {
                    this.pages.push(start++);
                }
                if(this.firstVisble) {
                    this.pages.shift();
                }
                if(this.lastVisble) {
                    this.pages.pop();
                }
            },
            prevPage() {
                let page = this.currentPage - this.pageCount;
                if(page < 1) {
                    page = 1;
                }
                this.pageTo(page);
            },
            nextPage() {
                let page = this.currentPage + this.pageCount;
                if(page > this.last) {
                    page = this.last;
                }
                this.pageTo(page);
            },
            next() {
                let page = this.currentPage;
                if(++page > this.last) {
                    page = this.last;
                }
                this.pageTo(page);
            },
            prev() {
                let page = this.currentPage;
                if(--page < 1) {
                    page = 1;
                }
                this.pageTo(page);
            },
            pageTo(page) {
                if(this.currentPage !== page) {
                    this.jumpPage = this.currentPage = page;
                    this.$emit('update:page', page);
                    this.$emit('page-change', page);
                }
            }
        }
    })

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
            m_select_all: false,
        },
        methods: {
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
                        message('删除成功')
                    }).catch(err => {
                        message(err.message);
                    });
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
                        message('删除成功')
                    }).catch(err => {
                        message(err.message);
                    });
                }
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
                }).catch(err => {
                    message(err.message);
                });
            }
        },
        updated() {
            this.m_select_all = this.list.every(d => this.sels[d.id]);
        },
        created() {
            this.getList();
        }
    })
})();