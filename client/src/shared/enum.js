const HTTPError = {
    // 400: Bad request
    FIELDS_REQUIRED: 'All fields required', 
    DUPLICATE_USER: 'Duplicate user',
    // 401: Unauthorized
    USERNAME_NOT_FOUND: 'Username not found',
    INVALID_PASSWORD: 'Invalid password',
    UNAUTHORIZED: 'Unauthorized',
    // 403: Forbidden
    ATTACK_RISK: 'Refresh token reuse', // trigger log-out
    REFRESH_TOKEN_EXPIRED: 'Refresh token expired', // trigger log-out
    ACCESS_TOKEN_EXPIRED: 'Access token expired', // trigger refresh token
    // 500: Internal server error
    FILE_ERR: 'File public access denied',
    ERROR: 'error',
}

const HTTPSuccess = {
    // 200 OK
    REGISTER_SUCCESS: 'Registered success',
    LOGIN_SUCCESS: 'Login success',
    LOGOUT_SUCCESS: 'Logout success',
    REFRESH_TOKEN_SUCCESS: 'Refresh success'
}

const LSItems = {
    USER_DATA: 'userdata',
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    CUR_PAGE: 'curPage',
    POST_VIEW: 'view'
}

const AuthService = {
    REGISTER_SUCCESS: "Register success",
    LOGIN_SUCCESS: "Login success",
    FIELDS_EMPTY: "Fields empty",
    USERNAME_NOT_FOUND: "Username mismatch",
    INVALID_PASSWORD: "Password mismatch",
    RESEND_REQUEST: "Resend request",
    LOGOUT: "Log out triggered",
    SERVER_ERR: "Server error"
}

module.exports = {
    HTTPError: HTTPError,
    HTTPSuccess: HTTPSuccess,
    LSItems: LSItems,
    AuthService: AuthService
}