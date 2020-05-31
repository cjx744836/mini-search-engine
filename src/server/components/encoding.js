import Vue from 'vue/dist/vue.esm.js';

Vue.component('encoding-dlg', {
    template: `
        <div class="encoding-dlg" v-if="visible">
            <span>选择编码</span>
            <select v-model="encoding">
                <option value="utf-8">utf-8</option>
                <option value="gb2312">gb2312</option>
                <option value="gbk">gbk</option>
                <option value="big-5">big-5</option>
            </select>
            <button @click="confirm">确定</button>
            <button @click="close">关闭</button>
        </div>
    `,
    props: {
        visible: Boolean
    },
    data() {
        return {
            encoding: 'gb2312',
            visible: false
        }
    },
    methods: {
        confirm() {
            this.$emit('confirm', this.encoding);
            this.close();
        },
        close() {
            this.$emit('update:visible', false);
        }
    }
});