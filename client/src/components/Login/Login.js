import "./Login.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ValidateMsg, ErrorMsg } from "../Common/ValidateMsg";
import classNames from "classnames";
const { authService, authEventEmitter } = require("../../services/auth.service");
const { AuthService } = require("../../shared/enum");
import { useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameEmpty, setUsernameEmpty] = useState(false);
    const [usernameLenLimit, setUsernameLenLimit] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordEmpty, setPasswordEmpty] = useState(false);
    const [passwordLenLimit, setPasswordLenLimit] = useState(false);
    const [fieldsEmpty, setFieldsEmpty] = useState(false);
    const [userError, setUserError] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userReq = new authService();

    useEffect(()=> {
        authEventEmitter.on("user_login", handleLoginEvent);

        return () => {
            authEventEmitter.removeListener("user_login", handleLoginEvent);
        }
    }, [])

    const onInputChange = (event) => {
        let inputName = event.target.name;
        let inputValue = event.target.value;
        let inputMinLen = event.target.minLength;
        let inputMaxLen = event.target.maxLength;
        switch(inputName) {
            case "username":
                setUsername(inputValue);
                setUsernameLenLimit(inputValue.length == inputMaxLen);
                setUsernameEmpty(inputValue == "");
                break;
            case "password":
                setPassword(inputValue);
                setPasswordLenLimit(inputValue.length == inputMaxLen);
                setPasswordEmpty(inputValue == "");
                break;
            default:
                break;
        }
    }

    const register = () => {
        navigate("/register");
    }

    const login = () => {
        userReq.login(username, password);
    }

    const handleKeyPress = (event) => {
        let key = event.keyCode;
        if (key == 13) {
            login();
        }
    }

    const handleLoginEvent = (login_status) => {
        console.log("login status: ", login_status);
        if (login_status == AuthService.LOGIN_SUCCESS) {
            dispatch(logout(false));
            // nav to home page
            navigate("/");
        } else if (login_status == AuthService.FIELDS_EMPTY) {
            setFieldsEmpty(true);
        } else if (login_status == AuthService.USERNAME_NOT_FOUND ||
            login_status == AuthService.INVALID_PASSWORD) {
            setUserError(true);
        } else if (login_status == AuthService.SERVER_ERR) {
            // toast
        }
    }

    const onToggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    let usernameClass = classNames({
        "form-control": true,
        "control-active": username.length > 0
    })

    let passwordClass = classNames({
        "form-control password": true,
        "control-active": password.length > 0
    })

    return (
        <div className="container-fluid p-5 login-container">
            <div className="row">
                <div className="col-md-6 flex-center-wrapper">
                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className="img-fluid" alt="Phone image" />
                </div>

                <div className="col-md-6 flex-center-wrapper">
                    <div className="login-form p-5">
                        <div className="login-form-container">
                            <h2 className="fw-bold mb-5 text-center">Sign in</h2>
                            <div className="form-field mb-4">
                                <input 
                                    className={usernameClass}
                                    value={username}
                                    name="username"
                                    onChange={onInputChange}
                                    type="text"
                                    autoFocus
                                    maxLength={13}
                                    autoComplete='none'
                                ></input>
                                <label className="form-label">Username</label>
                                {usernameEmpty && 
                                <ValidateMsg
                                    fieldName="username"
                                ></ValidateMsg>
                                }
                                {usernameLenLimit && 
                                <ErrorMsg
                                    text="Please enter shorter name"
                                ></ErrorMsg>}
                            </div>

                            <div className="form-field mb-4">
                                <input 
                                    className={passwordClass}
                                    value={password}
                                    name="password"
                                    onChange={onInputChange}
                                    type={showPassword ? "text" : "password"} 
                                    minLength={6}
                                    maxLength={13}
                                ></input>
                                <label className="form-label">Password</label>
                                <i
                                    className={showPassword ? "fa-regular fa-eye-slash login-show-password-icon" : "fa-regular fa-eye login-show-password-icon"} 
                                    title={showPassword ? "Hide password" : "Show password"}
                                    onClick={onToggleShowPassword}>
                                </i>
                                {passwordEmpty && 
                                <ValidateMsg
                                    fieldName="password"
                                ></ValidateMsg>
                                }
                                {passwordLenLimit && 
                                <ErrorMsg
                                    text="Please enter 6-12 characters"
                                ></ErrorMsg>}
                            </div>
                            
                            <button 
                            className="btn btn-primary btn-lg mb-4 w-100"
                            onClick={login}
                            >LOGIN</button>

                            {fieldsEmpty &&
                            <ErrorMsg
                                text="Sorry username and password can not be empty"
                            ></ErrorMsg>
                            }
                            {userError &&
                            <ErrorMsg
                                text="Sorry your username and password don't match"
                                class="mb-4"
                            ></ErrorMsg>
                            }
                            
                            <div className="divider d-flex-row my-4">
                                <p className="text-center font-w-bold mx-3 mb-0">Or</p>
                            </div>

                            <div className="d-flex-row pb-4 mb-4">
                                <p className="mb-0">Don't have an account?</p> 
                                <button 
                                className="btn btn-outline-primary mx-2"
                                onClick={register}
                                >Register here</button>   
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;