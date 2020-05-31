import Vue from 'vue/dist/vue.esm.js';
import request from './request';
import '@/server/components/message';

new Vue({
    el: '#app',
    data: {
        formData: {
            name: '',
            pwd: ''
        }
    },
    methods: {
        submit() {
            if(this.formData.name.length < 1 || this.formData.pwd.length < 1) {
                return this.$message('用户名或密码不能为空');
            }
            request('/submit', 'post', this.formData).then(res => {
                document.location = '/manager';
            })
        }
    }
})
