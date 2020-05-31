import Vue from 'vue/dist/vue.esm.js';

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