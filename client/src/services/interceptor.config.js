import axios from "axios";
import localStorageService from "./local.storage.service";
const TokenService = new localStorageService();
// const base_url = "http://localhost:3002";
const base_url = "https://post-manage-react.herokuapp.com";
const { HTTPError, HTTPSuccess } = require("../shared/enum");

// Request interceptor
// axios.interceptors.request.use((config) => {...});

// Response interceptor
// axios.interceptors.response.use((response) => {...});

const instance = axios.create({
    baseURL: base_url
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
      const token = TokenService.getAccessToken();
      if (token) {
        config.headers["Authorization"] = 'Bearer ' + token;  
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
        const originalRequest = err.config;
    
        if (err.response) {
            // console.log(err.response);
            // Access Token was expired
            if (err.response.status === 403 && err.response.data.message == 'Access token expired' && !originalRequest._retry) {
                originalRequest._retry = true;
                // send refresh token request
                let res;
                let config =  {
                    headers: {
                        'Authorization': "Bearer " + TokenService.getRefreshToken()
                    }
                };
                try {
                    res = await axios.get(base_url+"/auth/refresh", config);
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
        
                if (token_info.refreshSuccess) {
                    // console.log("refresh success");
                    // store user data in LS
                    TokenService.setUserData(token_info);
                    TokenService.setAccessToken(token_info.accessToken);
                    TokenService.setRefreshToken(token_info.refreshToken);
                    return instance(originalRequest); // retry original request
                } else if (token_info.hasAttackRisk || token_info.refreshTokenExpired || token_info.hasServerError) {
                    // console.log("refresh failed");
                    res.logout = true;
                    return Promise.reject(res); // trigger log out
                }
            }
        }
  
        return Promise.reject(err);
    }
);
  
export default instance;