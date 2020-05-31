import message from '@/server/components/message';
export default function(url, method, param) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: method,
            credentials: 'include',
            body: JSON.stringify(param),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => {
            res.json().then(data => {
                if(res.status === 500) {
                    message(data.err);
                }
                if(res.status === 200) {
                    resolve(data);
                }
            });
        })
    })
};