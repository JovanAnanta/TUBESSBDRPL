import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LoginPage } from "../page/LoginPage";
import Register from "../page/Register";
import {HomePage} from "../page/HomePage";

const isAuthenticated = localStorage.getItem("token") !== null; 

const Routers = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    // element: isAuthenticated ? <HomePage /> : <Navigate to="/login" />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/user",
        element: isAuthenticated ? <HomePage /> : <Navigate to="/login" />,
        children: [
          // { path: "/post", element: <PostPage /> },
        ]
  },
]);

export function Router() {
  return <RouterProvider router={Routers} />;
}
