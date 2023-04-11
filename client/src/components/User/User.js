import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, Navigate, NavLink } from "react-router-dom";
import linkItem from '../../shared/listData';
const { authService, authEventEmitter } = require("../../services/auth.service");
import { useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import "./User.css";

function User() {
    const navList = ([
        new linkItem(1, 'Home', '/'),
        new linkItem(2, 'Post', 'post')
    ]);
    const [redirect, setRedirect] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userReq = new authService();
    const currentUser = userReq.getCurrentUser();

    useEffect(() => {
        if (!currentUser) setRedirect("/login");

        // component did mount: add subcriptions
        authEventEmitter.on("user_logout", handleLogoutEvent);

        return () => {
            // component will unmount: clear subscriptions
            authEventEmitter.removeListener("user_logout", handleLogoutEvent);
        }
    }, []);

    const onLogout = () => {
        userReq.logout();
    };

    const handleLogoutEvent = () => {
        dispatch(logout(true));
    }
    
    let menu = navList.map((ul, index) => {
        return (
            <li className="user-nav-menu-item" key={index}>
                <NavLink to={ul.link}
                    className={({ isActive, isPending }) =>
                    isPending ? "pending user-nav-menu-link" : isActive ? "active user-nav-menu-link" : "user-nav-menu-link"
                  }
                >
                    {ul.name}
                </NavLink>
            </li>
        )
    })

    if (redirect) {
        return <Navigate to={redirect} />
    }

    let username;
    if(currentUser) {
        username = (
            <span>({currentUser.username})</span>
        )
    }

    return (
        <div className="User">
            <header className="user-header">
                <nav className="user-nav container">
                    <div className="user-nav-brand" 
                    onClick={() => navigate("/")}
                    >
                        <i className="fa-regular fa-face-smile"></i>
                        <div className="user-nav-brand-title">Zoe-post</div>
                    </div>
                    <ul className="user-nav-menu">
                        {menu}
                        <li className="user-nav-menu-item">
                            <button className="btn btn-primary" onClick={onLogout} style={{ textTransform: "capitalize" }}>Logout {username}</button>
                        </li>
                    </ul>
                    {/* <button className="getMenu .btn" onClick={toggleSidebar}>
                        <i className="fa-solid fa-bars"></i>
                    </button> */}
                </nav>
            </header>
            <main className="">
                {/* app content */}
                <div className='user-content'><Outlet /></div>
            </main>
        
            {/* app footer */}
            <footer className="container">
                <div className="user-footer">
                    <div className="user-footer-contact-list">
                        <ul className="user-footer-contacts">
                            <li className="user-footer-contact">
                                <i className="fab fa-facebook-square user-footer-icon"></i>
                            </li>
                            <li className="user-footer-contact">
                                <i className="fab fa-linkedin user-footer-icon"></i>
                            </li>
                            <li className="user-footer-contact">
                                <i className="fab fa-github user-footer-icon"></i>
                            </li>
                        </ul>
                    </div>
                    <div className="user-footer-author col-dm-12">
                        <p className="text-capitalize">Coded & Designed by zoe</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default User;