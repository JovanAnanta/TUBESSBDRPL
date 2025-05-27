import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TagihanComponent } from "../Components/TagihanComponent";
import AdminDashboard from "../page/AdminHomepage";
import AdminLoanManagement from "../page/AdminLoanManagement";
import AdminLogin from "../page/AdminLogin";
import AdminUserManagement from "../page/AdminUserManagement";
import AuthLayout from "../page/AuthLayout";
import CekPinPage from "../page/cekPinPage";
import CSCustomerActivityPage from '../page/CSActivity';
import CSHomePage from '../page/CSHomePage';
import CSLogin from '../page/CSLogin';
import CSReportPage from '../page/CSReportPage';
import CSResetPassword from '../page/CSResetPassword';
import CSValidationPage from '../page/CSValidation';
import InfoSaldo from "../page/DetailHomePage/DetailMInfo/InfoSaldo";
import MutasiDatePage from "../page/DetailHomePage/DetailMInfo/MutasiDatePage";
import MutasiListPage from "../page/DetailHomePage/DetailMInfo/MutasiListPage";
import TopUp from "../page/DetailHomePage/DetailMTransfer/TopUp";
import Transfer from "../page/DetailHomePage/DetailMTransfer/Transfer";
import { MInfo } from "../page/DetailHomePage/MInfo";
import { MPayment } from "../page/DetailHomePage/MPayment";
import { Mtransfer } from "../page/DetailHomePage/MTransfer";
import { Setting } from "../page/DetailHomePage/Setting";
import EReceipt from "../page/E-Receipt";
import GantiPassword from "../page/GantiPassword";
import { GantiPin } from "../page/GantiPin";
import HomePage from "../page/HomePage";
import LoginPage from "../page/Login";
import PinjamanPage from "../page/Pinjaman";
import RegisterPage from "../page/Register";
import PinPage from "../page/SetPinPage";
import UserLayout from "../page/UserLayout";
import { ProtectedAdmin, ProtectedCS, ProtectedUser } from "./ProtectedRoute";
import InformationBanking from "../page/InformationBanking";

const checkAuth = () => {
  const token = localStorage.getItem("token");
  return token && token.trim() !== '';
};

const checkCSAuth = () => {
  const token = localStorage.getItem("cs_token");
  return token && token.trim() !== '';
};

const checkAdminAuth = () => {
  const token = localStorage.getItem("admin_token");
  return token && token.trim() !== '';
};

const Routers = createBrowserRouter([
  // Basic routes
  {
    path: "",
    element: <LoginPage />
  },
  {
    path: "info-layanan",
    element: <InformationBanking />
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
  // User routes
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
      { path: "nasabah/ganti-password", element: <GantiPassword /> },
      { path: "mpayment/pinjaman", element: <PinjamanPage /> },
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
    path: "/cs/reset-password",
    element: (
      <ProtectedCS>
        <CSResetPassword />
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
  },
  // Admin Routes
  {
    path: "/admin/login",
    element: <AdminLogin />
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedAdmin>
        <AdminDashboard />
      </ProtectedAdmin>
    )
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdmin>
        <AdminDashboard />
      </ProtectedAdmin>
    )
  },
  {
    path: "/admin/loan-management",
    element: (
      <ProtectedAdmin>
        <AdminLoanManagement />
      </ProtectedAdmin>
    )
  },
  {
    path: "/admin/user-management",
    element: (
      <ProtectedAdmin>
        <AdminUserManagement />
      </ProtectedAdmin>
    )
  }
]);

export function Router() {
  return <RouterProvider router={Routers} />;
}
