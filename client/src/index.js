import React from 'react';
import { createRoot } from 'react-dom/client';
import store from './store';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import User from './components/User/User';
import Home from './components/Home/Home';
import PostList from './components/PostList/PostList';
import PostForm from './components/PostForm/PostForm';
import PostNew from './components/PostNew/PostNew';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
// import { Provider } from 'react-redux';
// import store from './store';
// get rid of outlet and children path
// all paths are the same level

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "/",
        element: <User />,
        children: [
          // index routes render into their parent's route/URL
          // index component: placeholder component
          // 其他children component都有各自的url/route, 访问url就会在outlet中render对应的child component
          // 但是index的url/route和parent保持一致, 并且在访问parent url时, 会在outlet中render index component
          // 因为outlet是用来render child component的, 但访问parent url而不是one of child routes' path时, 没有任何child url对应, 那么会有empty outlet, parent page就会有空白
          // index就是作为default child route来fill parent's empty space的 
          // 这里parent是App, home就会和app route一致, 用来填补empty outlet的
          {
            index: true,
            element: <Home />
          },
          {
            path: "post",
            element: <PostList />,
          },
          {
            path: "post/:id",
            element: <PostForm />,
          },
          {
            path: "post/new",
            element: <PostNew />,
          }
        ],
      }
    ]
  },
]);

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
