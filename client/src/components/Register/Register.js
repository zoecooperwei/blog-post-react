import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ValidateMsg, ErrorMsg } from "../Common/ValidateMsg";
import classNames from "classnames";
const { authService, authEventEmitter } = require("../../services/auth.service");
const { AuthService } = require("../../shared/enum");

function Register() {
    const [username, setUsername] = useState("");
    const [usernameEmpty, setUsernameEmpty] = useState(false);
    const [usernameLenLimit, setUsernameLenLimit] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordEmpty, setPasswordEmpty] = useState(false);
    const [passwordLenLimit, setPasswordLenLimit] = useState(false);
    const [fieldsEmpty, setFieldsEmpty] = useState(false);
    const navigate = useNavigate();
    const userReq = new authService();

    useEffect(()=> {
        authEventEmitter.on("user_register", handleRegisterEvent);

        return () => {
            authEventEmitter.removeListener("user_register", handleRegisterEvent);
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

    const login = () => {
        navigate("/login");
    }

    const register = () => {
        userReq.register(username, password);
    }

    const handleRegisterEvent = (status) => {
        // console.log("register status: ", status);
        if (status == AuthService.REGISTER_SUCCESS) {
            // toast
            login();
        } else if (status == AuthService.FIELDS_EMPTY) {
            setFieldsEmpty(true);
        } else if (status == AuthService.SERVER_ERR) {
            // toast
        }
    }

    let usernameClass = classNames({
        "form-control": true,
        "control-active": username.length > 0
    })

    let passwordClass = classNames({
        "form-control": true,
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
                        <h2 className="fw-bold mb-6 text-center">Sign up</h2>
                        {fieldsEmpty &&
                        <ErrorMsg
                            text="Username and password can not be empty"
                        ></ErrorMsg>
                        }
                        <div className="form-field mb-4">
                            <input 
                                className={usernameClass}
                                value={username}
                                name="username"
                                onChange={onInputChange}
                                type="text"
                                autoFocus
                                maxLength={13}
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
                                type="text"
                                minLength={6}
                                maxLength={13}
                            ></input>
                            <label className="form-label">Password</label>
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
                        onClick={register}
                        >REGISTER</button>
                        
                        <div className="divider d-flex-row my-4">
                            <p className="text-center font-w-bold mx-3 mb-0">Or</p>
                        </div>

                        <div className="d-flex-row pb-4 mb-4">
                            <p className="mb-0">Already have an account?</p> 
                            <button 
                            className="btn btn-outline-primary mx-2"
                            onClick={login}
                            >Login here</button>   
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;