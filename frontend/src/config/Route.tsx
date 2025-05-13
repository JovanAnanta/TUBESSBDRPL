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


const isAuthenticated = localStorage.getItem("token") !== null; 

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
    element: isAuthenticated ? <UserLayout /> : <Navigate to="/login" />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "set-pin", element: <PinPage /> },
      { path: "minfo", element: <MInfo />},
      { path: "mtransfer", element: <MTransfer /> },
      { path: "mpayment", element: <MPayment /> },
      { path: "settings", element: <Setting /> },
    ]
  }
]);

export function Router() {
  return <RouterProvider router={Routers} />;
}
