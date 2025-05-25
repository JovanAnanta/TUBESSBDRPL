import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AuthLayout from "../page/AuthLayout";
<<<<<<< HEAD
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
import CSValidationPage from '../page/CSValidation';
import CSCustomerActivityPage from '../page/CSActivity';
import { ProtectedUser, ProtectedCS } from "./ProtectedRoute";

const checkAuth = () => {
  const token = localStorage.getItem("token");
  return token && token.trim() !== '';
};

const checkCSAuth = () => {
  const token = localStorage.getItem("cs_token");
  return token && token.trim() !== '';
};
=======
import CekPinPage from "../page/cekPinPage";
import CSHomePage from '../page/CSHomePage';
import CSLogin from '../page/CSLogin';
import CSReportPage from '../page/CSReportPage';
import InfoSaldo from "../page/DetailHomePage/DetailMInfo/InfoSaldo";
import MutasiRekening from "../page/DetailHomePage/DetailMInfo/MutasiRekening";
import TopUp from "../page/DetailHomePage/DetailMTransfer/TopUp";
import Transfer from "../page/DetailHomePage/DetailMTransfer/Transfer";
import { MInfo } from "../page/DetailHomePage/MInfo";
import { MPayment } from "../page/DetailHomePage/MPayment";
import MTransfer from "../page/DetailHomePage/MTransfer";
import { Setting } from "../page/DetailHomePage/Setting";
import EReceipt from "../page/E-Receipt";
import GantiPassword from '../page/GantiPassword';
import { GantiPin } from "../page/GantiPin";
import HomePage from "../page/HomePage";
import LoginPage from "../page/Login";
import RegisterPage from "../page/Register";
import PinPage from "../page/SetPinPage";
import UserLayout from "../page/UserLayout";
>>>>>>> origin/main


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
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> }, // default route
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> }
    ]
  },
  {
    path: "/user",
<<<<<<< HEAD
    element: (
      <ProtectedUser>
        <UserLayout />
      </ProtectedUser>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "set-pin", element: <PinPage /> },
      { path: "minfo", element: <MInfo /> },
      { path: "mtransfer", element: <MTransfer /> },
      { path: "mpayment", element: <MPayment /> },
      { path: "settings", element: <Setting /> }
=======
    element: checkAuth() ? <UserLayout /> : <Navigate to="/auth/login" />,    children: [
      { index: true, element: <HomePage /> },
      { path: "set-pin", element: <PinPage /> },
      { path: "verify-pin", element: <CekPinPage /> },
      { path: "minfo", element: <MInfo />},
      { path: "mtransfer", element: <MTransfer />},
      { path: "minfo/saldo", element: <InfoSaldo />},
      { path: "minfo/mutasi", element: <MutasiRekening />},
      { path: "mtransfer/transfer", element: <Transfer /> },
      { path: "mtransfer/top-up", element: <TopUp /> },
      { path: "e-receipt/:transaksiId", element: <EReceipt /> },
      { path: "mpayment", element: <MPayment /> },
      { path: "mpayment/:type", element: <TagihanComponent /> },
      { path: "settings", element: <Setting /> },
      { path: "nasabah/ganti-pin", element: <GantiPin />},
      { path: "nasabah/ganti-password", element: <GantiPassword /> }
>>>>>>> origin/main
    ]
  },
  // CS Routes
  {
    path: "/cs/login",
    element: <CSLogin />
  },
  {
    path: "/cs/dashboard",
    element: (
      <ProtectedCS>
        <CSHomePage />
      </ProtectedCS>
    )
  },
  {
    path: "/cs",
    element: (
      <ProtectedCS>
        <CSHomePage />
      </ProtectedCS>
    )
  },
  {
    path: "/cs/reports",
    element: (
      <ProtectedCS>
        <CSReportPage />
      </ProtectedCS>
    )
  },
  {
    path: "/cs/validation",
    element: (
      <ProtectedCS>
        <CSValidationPage />
      </ProtectedCS>
    )
  },
  {
    path: "/cs/customer-activity",
    element: (
      <ProtectedCS>
        <CSCustomerActivityPage />
      </ProtectedCS>
    )
  }
]);

export function Router() {
  return <RouterProvider router={Routers} />;
}
