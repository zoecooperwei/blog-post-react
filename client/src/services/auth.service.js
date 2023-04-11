import axios from 'axios';
const { EventEmitter } = require('events');
var authEventEmitter = new EventEmitter();
// const base_url = "http://localhost:3002";
const base_url = "https://blog-post-react.herokuapp.com";
const { HTTPError, HTTPSuccess } = require("../shared/enum");
import localStorageService from "../services/local.storage.service";
const { AuthService } = require("../shared/enum");

class authService {
    constructor() {
        this.http = axios;
        this.localStorageManager = new localStorageService();
    }

    async register(username, password) {
        let data = { username: username, password: password };
        let res;
        try {
            res = await this.http.post(base_url+"/auth/register", data);
        } catch (err) {
            res = err.response;
        };

        let register_info = {
            registerSuccess: res.status == 200 && res.data.message == HTTPSuccess.REGISTER_SUCCESS,
            hasFieldError: res.status == 400 && res.data.message == HTTPError.FIELDS_REQUIRED,
            hasServerError: res.status == 500,
            message: res.data.message
        };

        let register_status;
        if (register_info.registerSuccess) {
            register_status = AuthService.REGISTER_SUCCESS; // provide register success notification
        } else if (register_info.hasFieldError) {
            register_status = AuthService.FIELDS_EMPTY; // provide error notification
        } else if (register_info.hasServerError) {
            register_status = AuthService.SERVER_ERR; // provide error notification
        };

        authEventEmitter.emit('user_register', register_status);
    }

    async login(username, password) {
        let data = { username: username, password: password };
        let res;
        try {
            res = await this.http.post(base_url+"/auth/login", data); // success
            /** AxiosSuccess: object: data, status, statusText*/
        } catch (err) {
            res = err.response;
            /** AxiosError: object: response: data, status, statusText */
        };

        let login_info = {
            loginSuccess: res.status == 200 && res.data.message == HTTPSuccess.LOGIN_SUCCESS,
            accessToken: res.data?.accessToken,
            refreshToken: res.data?.refreshToken, // store it in LS,
            username: res.data?.username,
            message: res.data.message,
            hasFieldError: res.status == 400 && res.data.message == HTTPError.FIELDS_REQUIRED,
            hasUsernameError: res.status == 401 && res.data.message == HTTPError.USERNAME_NOT_FOUND,
            hasPasswordError: res.status == 401 && res.data.message == HTTPError.INVALID_PASSWORD,
            hasServerError: res.status == 500
        };

        let login_status;
        if (login_info.loginSuccess) {
            // store user data in LS
            this.localStorageManager.setUserData(login_info);
            this.localStorageManager.setAccessToken(login_info.accessToken);
            this.localStorageManager.setRefreshToken(login_info.refreshToken);
            login_status = AuthService.LOGIN_SUCCESS; // trigger home page
        } else if (login_info.hasFieldError) {
            login_status = AuthService.FIELDS_EMPTY; // trigger empty field warning
        } else if (login_info.hasUsernameError) {
            login_status = AuthService.USERNAME_NOT_FOUND; // trigger username not found warning
        } else if (login_info.hasPasswordError) {
            login_status = AuthService.INVALID_PASSWORD; // trigger incorrect username password mismatch warning
        } else if (login_info.hasServerError) {
            login_status = AuthService.SERVER_ERR; // provide error notification
        };

        authEventEmitter.emit('user_login', login_status);
    }

    async refreshToken() {
        let res;
        let config =  {
            headers: {
                'Authorization': "Bearer " + this.localStorageManager.getUserData().refreshToken
            }
        };
        try {
            res = await this.http.get(base_url+"/auth/refresh", config);
        } catch (err) {
            res = err.response;
        };

        let token_info = {
            refreshSuccess: res.status == 200 && res.data.message == HTTPSuccess.REFRESH_TOKEN_SUCCESS,
            accessToken: res.data?.accessToken, // store it in LS,
            refreshToken: res.data?.refreshToken, // store it in LS,
            username: res.data?.username,
            message: res.data.message,
            hasAttackRisk: res.status == 403 && res.data.message == HTTPError.ATTACK_RISK,
            refreshTokenExpired: res.status == 403 && res.data.message == HTTPError.REFRESH_TOKEN_EXPIRED,
            hasServerError: res.status == 500 && res.data.message == HTTPError.ERROR
        };

        let token_status;
        if (token_info.refreshSuccess) {
            // store user data in LS
            this.localStorageManager.setUserData(token_info);
            token_status = AuthService.RESEND_REQUEST; // re-send request 
        } else if (token_info.hasAttackRisk || token_info.refreshTokenExpired) {
            token_status = AuthService.LOGOUT; // trigger log out
        } else if (token_info.hasServerError) {
            token_status = AuthService.SERVER_ERR; // provide error notification
        };

        authEventEmitter.emit('user_refresh_token', token_status); // received by root component and might trigger log out
    }

    async logout() {
        // let res;
        // try {
        //     res = await this.http.post(base_url+"/auth/logout");
        // } catch (err) {
        //     res = err.response;
        // };

        // let logout_info = {
        //     message: res.data.message,
        //     logoutSuccess: res.status == 200 && res.data.message == HTTPSuccess.LOGOUT_SUCCESS
        // };

        // let logout_status;
        // if (logout_info.logoutSuccess) {
        //     // clear local storage data
        //     this.localStorageManager.clearData();
        //     logout_status = AuthService.LOGOUT; // trigger log out
        // }; 
        this.localStorageManager.clearData();
        authEventEmitter.emit('user_logout');
    }

    getCurrentUser() {
        return this.localStorageManager.getUserData();
    }
}

export { authService, authEventEmitter }