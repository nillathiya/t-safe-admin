import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchWithdrawals } from '../../features/withdrawal/withdrawalSlice';

interface Card {
  title: string;
  value: string;
  color: string;
  icon: string;
  status: string;
}

const DashboardCards: React.FC = () => {
  const [hasFetched, setHasFetched] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const { withdrawals } = useSelector(
    (state: RootState) => state.withdrawal,
  );

  useEffect(() => {
    (async () => {
      try {
        if (!hasFetched && withdrawals.length === 0) {
          await dispatch(fetchWithdrawals()).unwrap();
          setHasFetched(true);
        }
      } catch (error) {
        console.error(error || 'Server error');
      }
    })();
  }, [dispatch, withdrawals, hasFetched]);

  // Count withdrawals based on status
  const withdrawalCounts = {
    pending: withdrawals.filter((w) => w.status === 0).length,
    approved: withdrawals.filter((w) => w.status === 1).length,
    rejected: withdrawals.filter((w) => w.status === 2).length,
  };

  const cards: Card[] = [
    {
      title: 'Withdrawal',
      value: withdrawalCounts.approved.toString(),
      color: 'bg-blue-200',
      icon: '💵',
      status: 'Approved',
    },
    {
      title: 'Withdrawal',
      value: withdrawalCounts.pending.toString(),
      color: 'bg-red-300',
      icon: '💵',
      status: 'Pending',
    },
    {
      title: 'Withdrawal',
      value: withdrawalCounts.rejected.toString(),
      color: 'bg-blue-200',
      icon: '💵',
      status: 'Rejected',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} text-black dark:bg-[#24303f] dark:text-gray-300 rounded-md shadow-md p-4 flex flex-col items-center transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105`}
        >
          <div className="text-3xl mb-2">{card.icon}</div>
          <h3 className="text-xl font-bold mb-1">{card.title}</h3>
          <hr className="w-50 border-black mb-2 dark:border-gray-300" />
          <p className="text-sm">{card.status}</p>
          <p className="text-lg font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
