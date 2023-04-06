const { LSItems } = require("../shared/enum");

class localStorageService {
    setUserData(userdata) {
        localStorage.setItem(LSItems.USER_DATA, JSON.stringify(userdata));
    }

    getUserData() {
        return JSON.parse(localStorage.getItem(LSItems.USER_DATA));
    }

    removeUserData() {
        localStorage.removeItem(LSItems.USER_DATA);
    }

    setAccessToken(accessToken) {
        localStorage.setItem(LSItems.ACCESS_TOKEN, JSON.stringify(accessToken));
    }

    getAccessToken() {
        return JSON.parse(localStorage.getItem(LSItems.ACCESS_TOKEN));
    }

    removeAccessToken() {
        localStorage.removeItem(LSItems.ACCESS_TOKEN);
    }

    setRefreshToken(refreshToken) {
        localStorage.setItem(LSItems.REFRESH_TOKEN, JSON.stringify(refreshToken));
    }

    getRefreshToken() {
        return JSON.parse(localStorage.getItem(LSItems.REFRESH_TOKEN));
    }

    removeRefreshToken() {
        localStorage.removeItem(LSItems.REFRESH_TOKEN);
    }

    setCurPagination(curPage) {
        localStorage.setItem(LSItems.CUR_PAGE, JSON.stringify(curPage));
    }

    getCurPagination() {
        return JSON.parse(localStorage.getItem(LSItems.CUR_PAGE));
    }

    removeCurPagination() {
        localStorage.removeItem(LSItems.CUR_PAGE);
    }

    setPostView(view) {
        localStorage.setItem(LSItems.POST_VIEW, JSON.stringify(view));
    }

    getPostView() {
        return JSON.parse(localStorage.getItem(LSItems.POST_VIEW));
    }

    removePostView() {
        localStorage.removeItem(LSItems.POST_VIEW);
    }

    clearData() {
        this.removeUserData();
        this.removeAccessToken();
        this.removeRefreshToken();
        this.removeCurPagination();
        this.removePostView();
    }
}

export default localStorageService;