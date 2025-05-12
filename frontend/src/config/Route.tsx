import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AuthLayout from "../page/AuthLayout";
import UserLayout from "../page/UserLayout";
import HomePage from "../page/HomePage";
import RegisterPage from "../page/Register";
import LoginPage from "../page/Login";
import PinPage from "../page/PinPage";

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

    ]
  }
]);

export function Router() {
  return <RouterProvider router={Routers} />;
}
