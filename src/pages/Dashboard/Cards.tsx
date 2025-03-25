import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAllOrdersAsync } from '../../features/order/orderSlice';
import { getAllUserAsync } from '../../features/user/userSlice';
import toast from 'react-hot-toast';
import { getAllIncomeTransactionAsync } from '../../features/transaction/transactionSlice';

export interface IncomeTransaction {
  totalIncome: number;
  stakingReward: number;
  profitSharingReward: number;
  royaltyReward: number;
  arbBonusReward: number;
}

const Cards: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companyInfo } = useSelector((state: RootState) => state.settings);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { users } = useSelector((state: RootState) => state.user);
  const { incomeTransactions } = useSelector(
    (state: RootState) => state.transaction,
  );
  const { currentUser: loggedInUser } = useSelector(
    (state: RootState) => state.auth,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [incomeData, setIncomeData] = useState<IncomeTransaction>({
    totalIncome: 0,
    stakingReward: 0,
    profitSharingReward: 0,
    royaltyReward: 0,
    arbBonusReward: 0,
  });
  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
    ?.value;

  useEffect(() => {
    if (!loggedInUser?._id) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const apiCalls = [];
        if (!orders.length)
          apiCalls.push(dispatch(getAllOrdersAsync()).unwrap());
        if (!users.length) apiCalls.push(dispatch(getAllUserAsync()).unwrap());

        const incomeFormData = { txType: 'income' };
        apiCalls.push(
          dispatch(getAllIncomeTransactionAsync(incomeFormData)).unwrap(),
        );

        const responses = await Promise.all(apiCalls);
        const incomeResponse = responses[responses.length - 1];
        const transactions = incomeResponse?.data ?? [];

        if (isMounted) {
          setIncomeData(
            transactions.reduce(
              (acc: any, tx: any) => {
                acc.totalIncome += tx.amount;
                if (tx.source === 'reward') acc.stakingReward += tx.amount;
                if (tx.source === 'direct')
                  acc.profitSharingReward += tx.amount;
                if (tx.source === 'roi') acc.royaltyReward += tx.amount;
                if (tx.source === 'royalty') acc.arbBonusReward += tx.amount;
                return acc;
              },
              {
                totalIncome: 0,
                stakingReward: 0,
                profitSharingReward: 0,
                royaltyReward: 0,
                arbBonusReward: 0,
              },
            ),
          );
        }
      } catch (error: any) {
        toast.error(error?.message || 'Service error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loggedInUser, orders.length, users.length, dispatch]);

  const updatedUsers = useMemo(() => {
    if (!orders.length || !users.length) return [];
    return users.map((user) => ({
      ...user,
      package: orders
        .filter((order) => order.customerId?._id === user._id)
        .reduce((acc, order) => acc + order.bv, 0),
    }));
  }, [users, orders]);

  const totalInvestment = useMemo(
    () => updatedUsers.reduce((acc, user) => acc + user.package, 0),
    [updatedUsers],
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const todayInvestment = updatedUsers.reduce((acc, user) => {
    return (
      acc +
      orders
        .filter(
          (order) =>
            new Date(order.createdAt).setHours(0, 0, 0, 0) ===
              today.getTime() && order.customerId?._id === user._id,
        )
        .reduce((sum, order) => sum + order.bv, 0)
    );
  }, 0);

  const yesterdayInvestment = updatedUsers.reduce((acc, user) => {
    return (
      acc +
      orders
        .filter(
          (order) =>
            new Date(order.createdAt).setHours(0, 0, 0, 0) ===
              yesterday.getTime() && order.customerId?._id === user._id,
        )
        .reduce((sum, order) => sum + order.bv, 0)
    );
  }, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {/* Investment Section */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-6 text-center">
          Investment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: 'Total',
              value: totalInvestment,
              gradient:
                'from-blue-500 to-indigo-500 dark:from-gray-900 dark:to-gray-800',
            },
            {
              label: 'Today',
              value: todayInvestment,
              gradient:
                'from-green-400 to-emerald-500 dark:from-gray-800 dark:to-gray-700',
            },
            {
              label: 'Yesterday',
              value: yesterdayInvestment,
              gradient:
                'from-red-400 to-orange-500 dark:from-gray-700 dark:to-gray-600',
            },
          ].map(({ label, value, gradient }, index) => (
            <div
              key={index}
              className={`flex flex-col items-center rounded-lg shadow p-5 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105
          bg-gradient-to-r ${gradient}`}
            >
              <h4 className="text-base font-medium text-white dark:text-gray-300 mb-2">
                {label}
              </h4>
              <strong className="text-lg text-white dark:text-gray-300">
                {companyCurrency}
                {value.toFixed(2)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* Income Report Section */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-6 text-center">
          Income Report
        </h3>
        <div className="space-y-4">
          {[
            {
              label: 'Total Income',
              value: incomeData.totalIncome,
              highlight: true,
            },
            { label: 'Staking Reward', value: incomeData.stakingReward },
            {
              label: 'Profit Sharing Reward',
              value: incomeData.profitSharingReward,
            },
            { label: 'Royalty Reward', value: incomeData.royaltyReward },
            { label: 'ARB Bonus Reward', value: incomeData.arbBonusReward },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`flex justify-between items-center p-4 rounded-lg shadow-sm 
          ${
            highlight
              ? 'bg-[#fca5a5] dark:bg-[#1a222c] text-white font-semibold'
              : 'bg-gray-100 dark:bg-[#1a222c]'
          }`}
            >
              <span className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                {label}
              </span>
              <strong className="text-lg sm:text-xl text-gray-800 dark:text-gray-200">
                {companyCurrency}
                {value.toFixed(2)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cards;
