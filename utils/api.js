/*
 * API service function
 * responsible for communication to server
 * url: URL
 * array_data : headers {}
 * array_data : path []
 * array_data : params {}
 * array_data : method get|post|put|delete
 * array_data : body {}
 */

class API {
    static request(url, array_data = {}) {
            // console.log('PreRequest=>', url, array_data);
            let headers = {};
            if (array_data.headers) {
                headers = array_data.headers;
            }
            if (!headers['Content-Type'] && array_data.body) {
                headers['Content-Type'] = 'application/json';
            }

            if (!headers.Accept) {
                headers.Accept = 'application/json';
            }

            url = (array_data.path) ? url + array_data.path.join('/') : url;

            // TODO Replace this with a standard querystring encoder like qs package
            if (array_data.params !== null && array_data.params !== undefined && Object.keys(array_data.params).length !== 0) {
                let params;
                Object.keys(array_data.params).forEach((key) => {
                    let pair;
                    if (array_data.params[key] === undefined) {
                        pair = `${key}`;
                    } else {
                        if (Array.isArray(array_data.params[key])) {
                            pair = '';
                            array_data.params[key].forEach(i => {
                                if (i.op) {
                                    pair = `${pair}&${key}${i.op}${encodeURIComponent(i.value)}`;
                                } else {
                                    pair = `${pair}&${key}[]=${encodeURIComponent(i)}`;
                                }
                            });
                            //remove first char in pair
                            pair = pair.substring(1);
                        } else {
                            if (typeof array_data.params[key] === 'object') {
                                pair = `${key}${array_data.params[key].op}${encodeURIComponent(array_data.params[key].value)}`;
                            } else {
                                pair = `${key}=${array_data.params[key]}`;
                            }
                        }
                    }
                    if (params === undefined) {
                        params = pair;
                    } else {
                        params = `${params}&${pair}`;
                    }
                });
                url = encodeURI(`${url}?${params}`);
            }
            let method = 'get';
            if (array_data.method !== undefined) {
                method = array_data.method;
            } else if (array_data.body !== undefined) {
                method = 'post';
            }

            const req = {
                method,
                headers: headers,
            };
            if (array_data.body) {
                req.body = array_data.body;
            }
            if (array_data.body && req.headers['Content-Type'] === 'application/json') {
                req.body = JSON.stringify(req.body);
            }
        // console.log('Post=>', url, req);
        return fetch(url, req)
            .then((response) => {
                // console.log('FetchStatus=>', response.status, ":", response.headers.get('content-type'), '::', url);
                // console.log('Response=>', response, response.headers);
                const statusCode = response.status;
                let headerContentType = null;
                switch (statusCode) {
                    case 200:
                    case 201:
                        headerContentType = response.headers.get('content-type');
                        if (headerContentType !== null && headerContentType.indexOf('application/json') >= 0) {
                            return response.json().then((d) => {
                                return { code: statusCode, body: d };
                            });
                        }
                        return response.text().then((d) => {
                            return { code: statusCode, body: d };
                        });
                    case 204:
                        return { code: statusCode, body: null };
                    case 400:
                    case 401:
                    case 403:
                    case 429:
                    case 405:
                        headerContentType = response.headers.get('content-type');
                        if (headerContentType !== null && headerContentType.indexOf('application/json') >= 0) {
                            return response.json().then((d) => {
                                throw { code: statusCode, body: d };
                            })
                        }
                        throw response.text().then((d) => {
                            throw { code: statusCode, body: d };
                        });
                    case 404:
                        throw new Error('Page not found');
                    default:
                        throw new Error('Something went wrong!');
                }
            }).catch((e) => {
                if (e instanceof Error) {
                    if (e.message === 'Failed to fetch') {
                        throw new Error('Please check your Internet connection');
                    }
                    throw new Error(e.message);
                } else {
                    throw e;
                }
            });
    }
}

export default API;
