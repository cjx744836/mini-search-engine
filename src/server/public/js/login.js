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
                    return message('用户名或密码不能为空');
                }
                request('/submit', 'post', this.formData).then(res => {
                    document.location = '/manager';
                }).catch(err => {
                    message(err.message);
                });
            }
        }
    })
})();