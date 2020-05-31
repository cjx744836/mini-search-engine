import Vue from 'vue/dist/vue.esm.js';

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

Vue.prototype.$message = message;

export default message;