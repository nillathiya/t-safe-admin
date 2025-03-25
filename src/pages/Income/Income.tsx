import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { INCOME_FIELDS } from '../../constants/appConstant';
import { RootState, AppDispatch } from '../../store/store';
import { getAllIncomeTransactionAsync } from '../../features/transaction/transactionSlice';
import toast from 'react-hot-toast';

const Income: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filteredMonth, setFilteredMonth] = useState<string>('');
  const {companyInfo}=useSelector((state:RootState)=>state.settings)

  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
  ?.value;
  const { incomeTransactions } = useSelector(
    (state: RootState) => state.transaction,
  );
  const { currentUser: loggedInUser } = useSelector(
    (state: RootState) => state.auth,
  );

  // Generate last 12 months for dropdown
  const last12Months = useMemo(() => {
    const currentDate = new Date();

    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      return {
        label: month.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        }),
        value: `${month.getFullYear()}-${month.getMonth() + 1}`,
      };
    });
  }, []);

  // get getRandomDateInMonth
  const getRandomDateInMonth = (year: number, month: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime()),
    );
  };

  // Function to apply the filter
  const handleFilter = () => {
    setFilteredMonth(selectedMonth);
  };

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (!filteredMonth)
      return incomeTransactions.map((tx) => ({
        ...tx,
        createdAt: getRandomDateInMonth(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
        ).toISOString(),
      }));

    const [year, month] = filteredMonth.split('-').map(Number);

    return incomeTransactions
      .map((tx) => ({
        ...tx,
        createdAt: getRandomDateInMonth(year, month).toISOString(),
      }))
      .filter(({ createdAt }) => {
        const date = new Date(createdAt);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;

        return formattedDate === filteredMonth;
      });
  }, [incomeTransactions, filteredMonth]);

  const formattedDate = useMemo(() => {
    if (!selectedMonth) return '';
    const [year, month] = selectedMonth.split('-').map(Number);
    return `${String(year).slice(2)}-${String(month).padStart(2, '0')}-01`;
  }, [selectedMonth]);

  const { incomeSummary, totalIncome } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, { status, source, amount }) => {
        if (status === 1 && source in INCOME_FIELDS) {
          acc.incomeSummary[source] = (acc.incomeSummary[source] || 0) + amount;
          acc.totalIncome += amount;
        }
        return acc;
      },
      { incomeSummary: {} as Record<string, number>, totalIncome: 0 },
    );
  }, [filteredTransactions]);

  useEffect(() => {
    const fetchIncomeTransactions = async () => {
      try {
        if (!incomeTransactions.length && loggedInUser?._id) {
          await dispatch(
            getAllIncomeTransactionAsync({ txType: 'all' }),
          ).unwrap();
        }
      } catch (error: any) {
        toast.error(error?.message || 'Service error');
      }
    };
    fetchIncomeTransactions();
  }, [loggedInUser, dispatch, incomeTransactions.length]);

  return (
    <div className="bg-gray-100 min-h-screen dark:bg-[#1a222c]">
      <Breadcrumb pageName="Income" />

      <div className="bg-white shadow-lg rounded-xl p-6 mt-4 dark:bg-[#24303f]">
        {/* Month Selection */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full md:w-auto">
            <select
              className="border border-gray-300 rounded-lg p-3 w-full md:w-auto dark:bg-[#1a222c] dark:text-gray-300 appearance-none pr-10"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {last12Months.map(({ value, label }, index) => (
                <option key={index} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M19.92 8.62a1 1 0 0 0-1.42 0L12 15.12l-6.5-6.5a1 1 0 1 0-1.42 1.42l7 7a1 1 0 0 0 1.42 0l7-7a1 1 0 0 0 0-1.42Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <button
            onClick={handleFilter}
            className="border border-gray-300 rounded-lg p-3 w-full md:w-auto dark:bg-[#1a222c] dark:text-gray-300"
          >
            Filter
          </button>
        </div>

        {/* Income Table */}
        <h2 className="text-2xl font-semibold text-center text-gray-500 mb-4 dark:text-gray-500">
          Income Section
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-center dark:bg-[#1a222c] dark:text-gray-300 border border-gray-300">
            <thead>
              <tr className="border text-black dark:text-gray-500">
                {Object.keys(INCOME_FIELDS).map((key) => (
                  <th
                    key={key}
                    className="border p-3 text-sm sm:text-base md:text-lg"
                  >
                    {INCOME_FIELDS[key as keyof typeof INCOME_FIELDS]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border text-black dark:text-gray-500">
                {Object.keys(INCOME_FIELDS).map((key) => (
                  <td key={key} className="border p-4">
                    {companyCurrency}{(incomeSummary[key] || 0).toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Income */}
        <p className="text-xl font-semibold text-center mt-6 text-gray-500">
          Total Income:
          <span className="text-blue-600 dark:text-white p-2">
            {companyCurrency}{totalIncome.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Income;
