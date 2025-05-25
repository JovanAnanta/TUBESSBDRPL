import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TagihanComponent } from "../Components/TagihanComponent";
import AuthLayout from "../page/AuthLayout";
import CekPinPage from "../page/cekPinPage";
import CSCustomerActivityPage from '../page/CSActivity';
import CSHomePage from '../page/CSHomePage';
import CSLogin from '../page/CSLogin';
import CSReportPage from '../page/CSReportPage';
import CSValidationPage from '../page/CSValidation';
import InfoSaldo from "../page/DetailHomePage/DetailMInfo/InfoSaldo";
<<<<<<< HEAD
import MutasiDatePage from "../page/DetailHomePage/DetailMInfo/MutasiDatePage";
import MutasiListPage from "../page/DetailHomePage/DetailMInfo/MutasiListPage";
=======
import MutasiRekening from "../page/DetailHomePage/DetailMInfo/MutasiRekening";
import TopUp from "../page/DetailHomePage/DetailMTransfer/TopUp";
import Transfer from "../page/DetailHomePage/DetailMTransfer/Transfer";
import { MInfo } from "../page/DetailHomePage/MInfo";
>>>>>>> fa24b798ebe07c1bf90b21e78b7b15a9b39f7c25
import { MPayment } from "../page/DetailHomePage/MPayment";
import { Mtransfer } from "../page/DetailHomePage/MTransfer";
import { Setting } from "../page/DetailHomePage/Setting";
import EReceipt from "../page/E-Receipt";
import GantiPassword from "../page/GantiPassword";
import { GantiPin } from "../page/GantiPin";
import HomePage from "../page/HomePage";
import LoginPage from "../page/Login";
import RegisterPage from "../page/Register";
import PinPage from "../page/SetPinPage";
import UserLayout from "../page/UserLayout";
import { ProtectedCS, ProtectedUser } from "./ProtectedRoute";

const checkAuth = () => {
  const token = localStorage.getItem("token");
  return token && token.trim() !== '';
};

const checkCSAuth = () => {
  const token = localStorage.getItem("cs_token");
  return token && token.trim() !== '';
};


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
    element: (
      <ProtectedUser>
        <UserLayout />
      </ProtectedUser>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "set-pin", element: <PinPage /> },
      { path: "verify-pin", element: <CekPinPage /> },
      { path: "minfo", element: <MInfo />},
      { path: "mtransfer", element: <Mtransfer />},
      { path: "minfo/saldo", element: <InfoSaldo />},
      { path: "minfo/mutasi", element: <MutasiDatePage />},
      { path: "minfo/mutasi/list", element: <MutasiListPage /> },
      { path: "mtransfer/transfer", element: <Transfer /> },
      { path: "mtransfer/top-up", element: <TopUp /> },
      { path: "e-receipt/:transaksiId", element: <EReceipt /> },
      { path: "mpayment", element: <MPayment /> },
      { path: "mpayment/:type", element: <TagihanComponent /> },
      { path: "settings", element: <Setting /> },
      { path: "nasabah/ganti-pin", element: <GantiPin />},
      { path: "nasabah/ganti-password", element: <GantiPassword /> }
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
