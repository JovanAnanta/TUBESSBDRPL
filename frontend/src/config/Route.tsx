import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AuthLayout from "../page/AuthLayout";
import UserLayout from "../page/UserLayout";
import HomePage from "../page/HomePage";
import RegisterPage from "../page/Register";
import LoginPage from "../page/Login";
import PinPage from "../page/SetPinPage";
import { MInfo } from "../page/DetailHomePage/MInfo";
import  { MPayment }  from "../page/DetailHomePage/MPayment";
import { MTransfer } from "../page/DetailHomePage/MTransfer";
import { Setting } from "../page/DetailHomePage/Setting";
import CSLogin from '../page/CSLogin';
import CSHomePage from '../page/CSHomePage';
import CSReportPage from '../page/CSReportPage';

const checkAuth = () => localStorage.getItem("token") !== null;

const Routers = createBrowserRouter([
  {
    path: "",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <LoginPage />
  },
  {
    path: "/auth",
    element:  <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> }, // default route
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> }
    ]
  },
  {
    path: "/user",
    element: checkAuth() ? <UserLayout /> : <Navigate to="/auth/login" />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "set-pin", element: <PinPage /> },
      { path: "minfo", element: <MInfo />},
      { path: "mtransfer", element: <MTransfer /> },
      { path: "mpayment", element: <MPayment /> },
      { path: "settings", element: <Setting /> },
    ]
  },
  {
    path: '/cs/login',
    element: <CSLogin />
  },
  {
    path: "/cs/dashboard",
    element: <CSHomePage />
  },
  {
    path: "/cs/reports",
    element: <CSReportPage />
  }
]);

export function Router() {
  return <RouterProvider router={Routers} />;
}
