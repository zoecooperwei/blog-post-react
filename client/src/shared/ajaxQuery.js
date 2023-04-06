class ajaxQuery {
    constructor(method, url, data) {
        this.method = method;
        this.url = url;
        this.data = data || {};
    }

    get() {
        let getPromise = new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open(this.method, this.url, true);
            req.onreadystatechange = () => {
                // 4: request finished and response is ready
                if (req.readyState == 4) {
                    // Returns the status-number of a request: 200: "OK", 403: "Forbidden", 404: "Not Found"
                    if (req.status === 200) {
                        resolve(req.response);
                    }   
                } else {
                    var statusText = req.statusText;
                    console.log('XMLHttpRequest %s response error :', url, req.status, statusText);
                    let errorCode = 'not reachable';

                    if ((!req.statusText || req.statusText.length == 0) && req.status === 0) {
                        errorCode = 'send error';
                    } else {
                        errorCode = req.status;
                    }
                    var error = {
                        'onError': true,
                        'errorCode': errorCode,
                        'errorMsg': statusText
                    };
                    reject(error);
                }
            };

            req.send();
        });

        return getPromise;
    }

    post() {
        let postPromise = new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open(this.method, this.url, true);
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            req.onreadystatechange = () => {
                // 4: request finished and response is ready
                if (req.readyState == 4) {
                    // Returns the status-number of a request: 200: "OK", 403: "Forbidden", 404: "Not Found"
                    if (req.status === 200) {
                        resolve(req.response);
                    }   
                } else {
                    var statusText = req.statusText;
                    console.log('XMLHttpRequest %s response error :', url, req.status, statusText);
                    let errorCode = 'not reachable';

                    if ((!req.statusText || req.statusText.length == 0) && req.status === 0) {
                        errorCode = 'send error';
                    } else {
                        errorCode = req.status;
                    }
                    var error = {
                        'onError': true,
                        'errorCode': errorCode,
                        'errorMsg': statusText
                    };
                    reject(error);
                }
            };

            req.send(this.data);
        });

        return postPromise;
    }

    put() {

    }

    delete() {

    }
}