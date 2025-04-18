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
import EditUser from './pages/Users/EditUser';
import Login from './pages/Login/Login';
import ChangePassword from './pages/Password/ChangePassword';
import CompanyInfoSetting from './pages/Settings/GeneralSettings/CompanyInfoSetting';
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
import ViewUserGeneration from './pages/Network/ViewUserGeneration';
import { AppDispatch, RootState } from './store/store';
import { ICompanyInfo } from './types/settings';
import { getAllCompanyInfoAsync } from './features/settings/settingsSlice';
import toast from 'react-hot-toast';
import EditSetting from './pages/Settings/GeneralSettings/EditSetting';
import NotFound from './components/NotFound';
import DepositRequest from './pages/Fund/DepositRequest';
import DepositHistory from './pages/Fund/DepositHistory';
import CashDepositRequest from './pages/Fund/CashDepositRequest';
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

  // useEffect(() => {
  //   const fetchCompanyInfo = async () => {
  //     try {
  //       await dispatch(getAllCompanyInfoAsync()).unwrap();
  //     } catch (error: any) {
  //       toast.error(error || 'Server Error');
  //     }
  //   };

  //   if (companyInfo.length === 0) {
  //     fetchCompanyInfo();
  //   }
  // }, [companyInfo.length, dispatch]);

  // // Extract values correctly
  // const appName =
  //   companyInfo.find((data) => data.label === 'companyName')?.value ||
  //   'Default App';
  // const favicon =
  //   companyInfo.find((data) => data.label === 'companyFavicon')?.value ||
  //   '/default-favicon.ico';

  // console.log(favicon);
  // useEffect(() => {
  //   if (appName && favicon) {
  //     // Set Application Name
  //     document.title = appName;

  //     // Set Favicon
  //     let link = document.querySelector(
  //       "link[rel~='icon']",
  //     ) as HTMLLinkElement | null;

  //     if (!link) {
  //       link = document.createElement('link') as HTMLLinkElement;
  //       link.rel = 'icon';
  //       document.head.appendChild(link);
  //     }

  //     link.href = `${API_URL}${favicon}`;
  //   }
  // }, [appName, favicon]);

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
          path="/setting/general-setting/companyInfo-settings"
          element={
            <>
              <PageTitle title="Company Info settings" />
              <CompanyInfoSetting />
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
        {/* Fund */}
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
          path="/fund/deposit-request"
          element={
            <>
              <PageTitle title="Deposit-Request" />
              <DepositRequest />
            </>
          }
        />
        <Route
          path="/fund/deposit-history"
          element={
            <>
              <PageTitle title="Deposit-History" />
              <DepositHistory />
            </>
          }
        />
        <Route
          path="/fund/cash-deposit-request"
          element={
            <>
              <PageTitle title="Deposit-History" />
              <CashDepositRequest />
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
      {/* Custom 404 Route - Catches all unmatched paths */}
      <Route
        path="*"
        element={
          <>
            <PageTitle title="Page Not Found" />
            <NotFound />
          </>
        }
      />
    </Routes>
  );
}

export default App;
