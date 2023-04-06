import axios from 'axios';
// axios.defaults.withCredentials = true;
const { EventEmitter } = require('events');
var postEventEmitter = new EventEmitter();
const base_url = "/user";
import localStorageService from "./local.storage.service";
const { authService } = require("./auth.service");
import instance from './interceptor.config';
const { HTTPError, HTTPSuccess } = require("../shared/enum");

class postService {
    constructor() {
        this.http = instance;
        this.userReq = new authService();
        this.localStorageManager = new localStorageService();
    }

    async getPosts(pageNum, limit) {
        let res = null;
        let error = false;
        let config =  {
            params: {
                pageNum: pageNum, 
                limit: limit
            },
        };

        // get query might take some time, we need to wait it(the promise) fulfilled and resolved
        try {
            // resolve status: successful
            // Equivalent to `axios.get('https://localhost:3001/posts?pageNum=pageNum&limit=limit')`
            res = await this.http.get(base_url+'/posts', config);
        } catch(err) {
            // reject status: error
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };
        
        // gui will treat this function as a promise, then get the return value as below
        // return { posts: res.data, error: error };
        postEventEmitter.emit('post_list_data', { posts: res?.data, error: error });
    }

    async searchPost(searchStr) {
        let res = null;
        let error = false;
        let config =  {
            params: {
                searchStr: searchStr 
            },
        };

        try {
            res = await this.http.get(base_url+'/posts/search', config);
        } catch(err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };

        postEventEmitter.emit('post_search_data', { search_data: res?.data, error: error });
    }

    async getTopPost(number) {
        let res = null;
        let error = false;
        let config =  {
            params: {
                number: number
            },
        };

        try {
            if (number && number > 0) {
                res = await instance.get(base_url+'/posts/top', config);
            }
        } catch (err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };

        postEventEmitter.emit('post_top_data', { top_data: res?.data, error: error });
    }

    async getPost(id) {
        let res = null;
        let error = false;
        let config =  {
            params: {
                postId: id
            },
        };

        try {
            res = await this.http.get(base_url+'/post', config);
        } catch(err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };

        postEventEmitter.emit('post_get_data', { post: res?.data, error: error });
    }

    /**
     * @params extraParams: object { key1: value1, key2: value2 }
     */
    async updatePost(id, title, desp, tags, rating, imagePath) {
        let data = {
            title: title,
            desp: desp,
            tags: tags,
            rating: rating,
            // selectedFile: imagePath
        };
        let res = null;
        let error = false;
        let config = { 
            // to put data to server, we need to add an HTTP header to specify the data type
            headers: {
                'Content-Type': 'application/json'
            },
            // url params
            params: { 
                postId: id 
            },
        };

        try {
            res = await this.http.put(base_url+'/post', data, config);
        } catch (err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };

        postEventEmitter.emit('post_update_data', { post: res?.data, error: error });
    }

    async updatePostImage(id, formData) {
        let res = null;
        let error = false;
        let config =  {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                postId: id
            },
        };

        try {
            res = await this.http.put(base_url+'/post/image', formData, config);
        } catch (err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };

        postEventEmitter.emit('post_update_data_image', { post: res?.data, error: error });
    }

    async saveNewPost(formData) {
        let res = null;
        let error = false;
        let fileError = false;
        let config =  {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        try {
            res = await this.http.post(base_url+'/posts/new', formData, config);
        } catch (err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
                return;
            };

            if (err.response) {
                console.log(err.response);
                if (err.response.status == 500 && err.response.data.message == HTTPError.FILE_ERR) {
                    fileError = true;
                };
            };

            return;
        };

        postEventEmitter.emit("post_new_data", { post: res?.data,  error: error, fileErr: fileError });
    }

    async deletePost(id) {
        let error = false;
        let res = null;
        let config =  {
            params: { 
                postId: id 
            }
        };

        try {
            res = await this.http.delete(base_url+'/posts', config);
        } catch (err) {
            error = true;
            // error: access token expire -> send refresh token request
            if (err.logout) {
                this.userReq.logout();
            };
            return;
        };

        postEventEmitter.emit("post_delete_data", { postId: id,  error: error });
    }
}

export { postService, postEventEmitter };