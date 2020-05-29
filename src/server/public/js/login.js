(function() {
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
                    return alert('用户名或密码不能为空');
                }
                axios.post('/submit', this.formData).then(res => {
                   if(res.data.code === 1000) {
                       alert('用户名或密码错误');
                   } else {
                       document.location = '/manager';
                   }
                });
            }
        }
    })
})();