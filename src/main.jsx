import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SignUpForm from './components/signup.jsx'
import SignInForm from './components/signin.jsx'
import TodoPage from './components/TodoPage.jsx'
import Calendar from './components/Calendar.jsx'
import './index.css'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ProfilePage from './components/profilePage.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children:[
      {
        path:'/',
        element: <TodoPage/>
      },
      {
        path:'/profile',
        element: <ProfilePage/>
      },
      {
        path:'/calendar',
        element: <Calendar/>
      },
      {
        path:'/signup',
        element: <SignUpForm/>
      },
      {
        path:'/signin',
        element:  <SignInForm />
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
