import React, { useEffect, useState } from 'react';
import CardDataStats from '../../components/CardDataStats';
import DashboardCards from '../../components/Tables/DashboardCards';
import CustomerList from './CustomerList';
import Cards from './Cards';
import './DashboardCard.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAllOrdersAsync } from '../../features/order/orderSlice';
import toast from 'react-hot-toast';
import { getAllUserAsync } from '../../features/user/userSlice';
import { getAllIncomeTransactionAsync } from '../../features/transaction/transactionSlice';
import { getAllCompanyInfoAsync } from '../../features/settings/settingsSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const { companyInfo } = useSelector((state: RootState) => state.settings);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { users } = useSelector((state: RootState) => state.user);
  const { incomeTransactions } = useSelector(
    (state: RootState) => state.transaction,
  );
  const { currentUser: loggedInUser } = useSelector(
    (state: RootState) => state.auth,
  );
  const [incomeData, setIncomeData] = useState({
    totalIncome: 0,
    stakingReward: 0,
    profitSharingReward: 0,
    royaltyReward: 0,
    arbBonusReward: 0,
  });
  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
    ?.value;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('loading is start');

        if (isMounted) {
          const apiCalls = [];

          // Orders API
          if (orders.length === 0) {
            apiCalls.push(dispatch(getAllOrdersAsync()).unwrap());
          }

          // Users API
          if (users.length === 0) {
            apiCalls.push(dispatch(getAllUserAsync()).unwrap());
          }

          // Company Info API
          if (companyInfo.length === 0) {
            apiCalls.push(dispatch(getAllCompanyInfoAsync()).unwrap());
          }

          // Income Transactions (All)
          if (incomeTransactions.length === 0) {
            const formData = { txType: 'all' };
            apiCalls.push(
              dispatch(getAllIncomeTransactionAsync(formData)).unwrap(),
            );
          }

          // Income Transactions (Income)
          const incomeFormData = { txType: 'income' };
          apiCalls.push(
            dispatch(getAllIncomeTransactionAsync(incomeFormData)).unwrap(),
          );

          const responses = await Promise.all(apiCalls);
          const incomeResponse = responses[responses.length - 1];
          const transactions = incomeResponse?.data ?? [];

          let total = 0,
            staking = 0,
            profitSharing = 0,
            royalty = 0,
            arbBonus = 0;

          transactions.forEach((tx: any) => {
            total += tx.amount;
            if (tx.source === 'reward') staking += tx.amount;
            if (tx.source === 'direct') profitSharing += tx.amount;
            if (tx.source === 'roi') royalty += tx.amount;
            if (tx.source === 'royalty') arbBonus += tx.amount;
          });

          setIncomeData({
            totalIncome: total,
            stakingReward: staking,
            profitSharingReward: profitSharing,
            royaltyReward: royalty,
            arbBonusReward: arbBonus,
          });
        }
      } catch (error: any) {
        toast.error(error || 'Service error');
      } finally {
        console.log('loading is complete');
        if (isMounted) setIsLoading(false);
      }
    };

    if (loggedInUser?._id) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [
    loggedInUser,
    orders.length,
    users.length,
    incomeTransactions.length,
    dispatch,
  ]);

  const activeUserCount = users.reduce(
    (acc, user) => (user.accountStatus?.activeStatus === 1 ? acc + 1 : acc),
    0,
  );

  const totalIncome = incomeTransactions.reduce(
    (acc, transaction) =>
      transaction.txType === 'income' ? acc + transaction.amount : acc,
    0,
  );

  const totalIncomeTransactionCharge = incomeTransactions.reduce(
    (acc, transaction) =>
      transaction.txType === 'income' ? acc + transaction.txCharge : acc,
    0,
  );

  const totalInvestment = orders.reduce(
    (acc, order) => (order.status === 1 ? acc + order.bv : acc),
    0,
  );

  console.log("loading",isLoading)
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Users"
          total={users.length || 0}
          isLoading={isLoading}
          bgGradient="bg-gradient-to-r from-blue-300 to-purple-300 dark:from-gray-800 dark:to-gray-800 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl"
        >
          <svg
            className="fill-gray dark:fill-white"
            width="26"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </CardDataStats>

        <CardDataStats
          title="Active"
          total={activeUserCount || 0}
          isLoading={isLoading}
          bgGradient="bg-gradient-to-r from-green-300 to-teal-300 dark:from-gray-800 dark:to-gray-800 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl"
        >
          <svg
            className="fill-gray dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CardDataStats>

        <CardDataStats
          title="Investment"
          total={totalInvestment || 0}
          isLoading={isLoading}
          bgGradient="bg-gradient-to-r from-yellow-300 to-orange-300 dark:from-gray-800 dark:to-gray-800 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl"
        >
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 20V10M10 20V4M16 20V14M22 20H2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="17"
              cy="6"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M15.5 6.5L17 8L20 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CardDataStats>

        <CardDataStats
          title="Total Income"
          total={totalIncome || 0}
          isLoading={isLoading}
          bgGradient="bg-gradient-to-r from-green-300 to-blue-300 dark:from-gray-800 dark:to-gray-800 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl"
        >
          <svg
            className="fill-gray dark:fill-white"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 7V17M9 10H15M9 14H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CardDataStats>

        <CardDataStats
          title="Income Charge"
          total={totalIncomeTransactionCharge || 0}
          isLoading={isLoading}
          bgGradient="bg-gradient-to-r from-purple-400 to-pink-400 dark:from-gray-800 dark:to-gray-800 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl"
        >
          <svg
            className="fill-gray dark:fill-white"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 7V17M9 10H15M9 14H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 6L12 2L8 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CardDataStats>
      </div>

      <DashboardCards />
      <Cards />
      <CustomerList />
    </>
  );
};

export default Dashboard;
