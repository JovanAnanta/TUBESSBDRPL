import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { TagihanComponent } from "../Components/TagihanComponent";
import AuthLayout from "../page/AuthLayout";
import CSHomePage from '../page/CSHomePage';
import CSLogin from '../page/CSLogin';
import CSReportPage from '../page/CSReportPage';
import { MInfo } from "../page/DetailHomePage/MInfo";
import InfoSaldo from "../page/DetailHomePage/InfoSaldo";
import MutasiRekening from "../page/DetailHomePage/MutasiRekening";
import { MPayment } from "../page/DetailHomePage/MPayment";
import { MTransfer } from "../page/DetailHomePage/MTransfer";
import { Setting } from "../page/DetailHomePage/Setting";
import { GantiPin } from "../page/GantiPin";
import HomePage from "../page/HomePage";
import LoginPage from "../page/Login";
import RegisterPage from "../page/Register";
import PinPage from "../page/SetPinPage";
import CekPinPage from "../page/cekPinPage";
import UserLayout from "../page/UserLayout";

const checkAuth = () => localStorage.getItem("token") !== null;

const Routers = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />
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
    element: checkAuth() ? <UserLayout /> : <Navigate to="/auth/login" />,    children: [
      { index: true, element: <HomePage /> },      
      { path: "set-pin", element: <PinPage /> },      
      { path: "verify-pin", element: <CekPinPage /> },
      { path: "minfo", element: <MInfo />},
      { path: "minfo/saldo", element: <InfoSaldo />},
      { path: "minfo/mutasi", element: <MutasiRekening />},
      { path: "mtransfer", element: <MTransfer /> },
      { path: "mpayment", element: <MPayment /> },
      { path: "mpayment/:type", element: <TagihanComponent /> },
      { path: "settings", element: <Setting /> },
      { path: "nasabah/ganti-pin", element: <GantiPin />}
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
