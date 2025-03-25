import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Chart from './pages/Chart';
import Dashboard from './pages/Dashboard/Dashboard';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import AllUsers from './pages/Users/AllUsers';
import Support from './pages/Support/Support';
import GeneralSetting from './pages/Settings/GeneralSettings';
import CategorySettings from './pages/Settings/GeneralSettings/CategorySettings';
import DataBaseBackUp from './pages/Settings/DataBaseBackUp';
import EditUser from './pages/Users/EditUser';
import Login from './pages/Login/Login';
import ChangePassword from './pages/Password/ChangePassword';
import RegistrationSetting from './pages/Settings/RegistrationSetting';
import InvestmentSetting from './pages/Settings/InvestmentSetting';
import WithdrawalSetting from './pages/Settings/WithdrawalSetting';
import FundSetting from './pages/Settings/FundSetting';
import ProfileSetting from './pages/Settings/ProfileSetting';
import DynamicpagesSetting from './pages/Settings/DynamicpagesSetting';
import ReInvestmentSetting from './pages/Settings/ReInvestmentSetting';
import AccountSetting from './pages/Settings/AccountSetting';
import RegisterWithOTPSetting from './pages/Settings/RegisterWithOTPSetting';
import BtcAddressOTPSetting from './pages/Settings/BtcAddressOTPSetting';
import BtcAddressWithOTPSetting from './pages/Settings/BtcAddressWithOTPSetting';
import LoginWithOTPSetting from './pages/Settings/LoginWithOTPSetting';
import PaymentMethodSetting from './pages/Settings/PaymentMethodSetting';
import PaymentMethodAcceptSetting from './pages/Settings/PaymentMethodAcceptSetting';
import CompanyInfoSetting from './pages/Settings/GeneralSettings/CompanyInfoSetting';
import PaymentMethodAcceptUpiSetting from './pages/Settings/PaymentMethodAcceptUpiSetting';
import PaymentMethodAcceptBankSetting from './pages/Settings/PaymentMethodAcceptBankSetting';
import PaymentMethodAcceptUsdtSetting from './pages/Settings/PaymentMethodAcceptUsdtSetting';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsLoggedIn } from './features/auth/authSlice';
import Team from './pages/Network/Team';
import WithdrawalApproved from './pages/Withdrawal/WithdrawalApproved';
import WithdrawalCancle from './pages/Withdrawal/WithdrawalCancle';
import WithdrawalPending from './pages/Withdrawal/WithdrawalPending';
import Income from './pages/Income/Income';
import ContactUs from './pages/Contact-us';
import Order from './pages/Order/Order';
import AddFund from './pages/Fund/AddFund';
import FundTransfer from './pages/Fund/FundTransfer';
import Member from './pages/Users/Member';
import Reward from './pages/Users/Reward';
import OrderView from './pages/Order/OrderView';
import ViewWithdrawal from './pages/Withdrawal/ViewWithdrawal';
import CustomerList from './pages/Dashboard/CustomerList';
import Cards from './pages/Dashboard/Cards';
import RankSettings from './pages/Settings/GeneralSettings/RankSettings';
import NewAndEvents from './pages/Settings/NewAndEvent';
import ViewUserGeneration from './pages/Network/viewUserGeneration';
import { AppDispatch, RootState } from './store/store';
import { ICompanyInfo } from './types/settings';
import { getAllCompanyInfoAsync } from './features/settings/settingsSlice';
import toast from 'react-hot-toast';
import { API_URL } from './constants';
import EditSetting from './pages/Settings/GeneralSettings/EditSetting';
function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { companyInfo } = useSelector((state: RootState) => state.settings);
  const [loading, setLoading] = useState<boolean>(true);
  const isAuthenticated = useSelector(selectIsLoggedIn);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        await dispatch(getAllCompanyInfoAsync()).unwrap();
      } catch (error: any) {
        toast.error(error || 'Server Error');
      }
    };

    if (companyInfo.length === 0) {
      fetchCompanyInfo();
    }
  }, [companyInfo.length, dispatch]);

  // Extract values correctly
  const appName =
    companyInfo.find((data) => data.label === 'companyName')?.value ||
    'Default App';
  const favicon =
    companyInfo.find((data) => data.label === 'companyFavicon')?.value ||
    '/default-favicon.ico';

  console.log(favicon);
  useEffect(() => {
    if (appName && favicon) {
      // Set Application Name
      document.title = appName;

      // Set Favicon
      let link = document.querySelector(
        "link[rel~='icon']",
      ) as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement('link') as HTMLLinkElement;
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      link.href = `${API_URL}${favicon}`;
    }
  }, [appName, favicon]);

  return loading ? (
    <Loader loader="ClipLoader" size={50} color="blue" fullPage={true} />
  ) : (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route element={<DefaultLayout children={undefined} />}>
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard/customerList"
          element={
            <>
              <PageTitle title="" />
              <CustomerList />
            </>
          }
        />
        <Route
          path="/dashboard/cards"
          element={
            <>
              <PageTitle title="" />
              <Cards />
            </>
          }
        />
        <Route
          path="/users/all-users"
          element={
            <>
              <PageTitle title="Users" />
              <AllUsers />
            </>
          }
        />
        <Route
          path="/users/member"
          element={
            <>
              <PageTitle title="Users" />
              <Member />
            </>
          }
        />
        <Route
          path="/users/reward"
          element={
            <>
              <PageTitle title="Users" />
              <Reward />
            </>
          }
        />
        {/* Network */}
        <Route
          path="/network/team"
          element={
            <>
              <PageTitle title="Netwok" />
              <Team />
            </>
          }
        />
        <Route
          path="/network/team/user/:id"
          element={
            <>
              <PageTitle title="Edit User" />
              <ViewUserGeneration />
            </>
          }
        />
        <Route
          path="/withdrawal/pending"
          element={
            <>
              <PageTitle title="Withdrawal" />
              <WithdrawalPending />
            </>
          }
        />
        <Route
          path="/view-withdrawal/:id"
          element={
            <>
              <PageTitle title="Withdrawals" />
              <ViewWithdrawal />
            </>
          }
        />
        <Route
          path="/withdrawal/approved"
          element={
            <>
              <PageTitle title="Withdrawal" />
              <WithdrawalApproved />
            </>
          }
        />
        <Route
          path="/withdrawal/cancelled"
          element={
            <>
              <PageTitle title="Withdrawal" />
              <WithdrawalCancle />
            </>
          }
        />
        <Route
          path="/users/edituser/:id"
          element={
            <>
              <PageTitle title="Edit User" />
              <EditUser />
            </>
          }
        />

        <Route
          path="/support"
          element={
            <>
              <PageTitle title="Support" />
              <Support />
            </>
          }
        />
        {/* Settings Routes Start*/}
        <Route
          path="/setting/general-setting"
          element={
            <>
              <PageTitle title="General settings" />
              <GeneralSetting />
            </>
          }
        />
        <Route
          path="/setting/news-and-events"
          element={
            <>
              <PageTitle title="News & Events" />
              <NewAndEvents />
            </>
          }
        />
        <Route
          path="/setting/general-setting/:category"
          element={
            <>
              <PageTitle title="Registration settings" />
              <CategorySettings />
            </>
          }
        />
         <Route
          path="/setting/general-setting/:category/:title"
          element={
            <>
              <PageTitle title="Registration settings" />
              <EditSetting />
            </>
          }
        />

        <Route
          path="/setting/general-setting/rank-settings"
          element={
            <>
              <PageTitle title="Rank settings" />
              <RankSettings />
            </>
          }
        />

        <Route
          path="/setting/general-setting/companyinfo"
          element={
            <>
              <PageTitle title="Company Info settings" />
              <CompanyInfoSetting />
            </>
          }
        />

        {/* Settings Routes End*/}

        <Route
          path="/setting/general-setting/investment/:id"
          element={
            <>
              <PageTitle title="Investment settings" />
              <InvestmentSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/withdrawal/:id"
          element={
            <>
              <PageTitle title="withdrawal settings" />
              <WithdrawalSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/fund/:id"
          element={
            <>
              <PageTitle title="Fund settings" />
              <FundSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/profile/:id"
          element={
            <>
              <PageTitle title="Profile settings" />
              <ProfileSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/dynamicpages/:id"
          element={
            <>
              <PageTitle title="Dynamicpages settings" />
              <DynamicpagesSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/reinvestment/:id"
          element={
            <>
              <PageTitle title="Reinvestment settings" />
              <ReInvestmentSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/account/:id"
          element={
            <>
              <PageTitle title="Account settings" />
              <AccountSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/registerwithOTP/:id"
          element={
            <>
              <PageTitle title="Register with OTP settings" />
              <RegisterWithOTPSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/btcaddressOTP/:id"
          element={
            <>
              <PageTitle title="BTC Address OTP settings" />
              <BtcAddressOTPSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/btcaddresswithOTP/:id"
          element={
            <>
              <PageTitle title="BTC Address With OTP settings" />
              <BtcAddressWithOTPSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/loginwithOTP/:id"
          element={
            <>
              <PageTitle title="Login with otp settings" />
              <LoginWithOTPSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/paymentmethod/:id"
          element={
            <>
              <PageTitle title="Payment Method settings" />
              <PaymentMethodSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/paymentmethodaccept/:id"
          element={
            <>
              <PageTitle title="Payment Accept Method settings" />
              <PaymentMethodAcceptSetting />
            </>
          }
        />

        <Route
          path="/setting/general-setting/paymentmethodaccept/upi/:id"
          element={
            <>
              <PageTitle title="UPI settings" />
              <PaymentMethodAcceptUpiSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/paymentmethodaccept/bank/:id"
          element={
            <>
              <PageTitle title="UPI settings" />
              <PaymentMethodAcceptBankSetting />
            </>
          }
        />
        <Route
          path="/setting/general-setting/paymentmethodaccept/usdt/:id"
          element={
            <>
              <PageTitle title="UPI settings" />
              <PaymentMethodAcceptUsdtSetting />
            </>
          }
        />

        <Route
          path="setting/back-up-setting"
          element={
            <>
              <PageTitle title="Database Backup" />
              <DataBaseBackUp />
            </>
          }
        />
        <Route path="/logout" element={<PageTitle title="Logout" />} />

        <Route
          path="/logout"
          element={
            <>
              <PageTitle title="Logout" />
            </>
          }
        />
        {/* other componant */}

        {/* <Route
          path="/calendar"
          element={
            <>
              <PageTitle title="Calendar" />
              <Calendar />
            </>
          }
        /> */}
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile" />
              <Profile />
            </>
          }
        />
        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables" />
              <Tables />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings" />
              <Settings />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup" />
              <SignUp />
            </>
          }
        />
        <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Basic Chart" />
              <Chart />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts" />
              <Alerts />
            </>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons" />
              <Buttons />
            </>
          }
        />
        <Route
          path=""
          element={
            <>
              <PageTitle title="Buttons" />
              <Buttons />
            </>
          }
        />
        <Route
          path="/order"
          element={
            <>
              <PageTitle title="order" />
              <Order />
            </>
          }
        />
        <Route
          path="/order/orderView"
          element={
            <>
              <PageTitle title="OrderView" />
              <OrderView />
            </>
          }
        />
        <Route
          path="/income"
          element={
            <>
              <PageTitle title="Income" />
              <Income />
            </>
          }
        />
        <Route
          path="/Contact"
          element={
            <>
              <PageTitle title="Contact" />
              <ContactUs />
            </>
          }
        />
        <Route
          path="/fund/add-fund"
          element={
            <>
              <PageTitle title="Contact" />
              <AddFund />
            </>
          }
        />
        <Route
          path="/fund/fund-transfer"
          element={
            <>
              <PageTitle title="Contact" />
              <FundTransfer />
            </>
          }
        />
        <Route
          path="/password/change-password"
          element={
            <>
              <PageTitle title="change password" />
              <ChangePassword />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
