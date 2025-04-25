import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  fetchWithdrawals,
  updateWithdrawalRequestAsync,
} from '../../features/withdrawal/withdrawalSlice';
import { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { IFundTransaction } from '../../types';
import { useCompanyCurrency } from '../../hooks/useCompanyInfo';

const ViewWithdrawal: React.FC = () => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { withdrawals, isLoading } = useSelector(
    (state: RootState) => state.withdrawal,
  );
  const { id: withdrawalId } = useParams<{ id: string }>();
  const [isWithdrawalUpdating, setIsWithdrawalUpdating] = useState<{
    label: string;
    value: boolean;
  }>({
    label: '',
    value: false,
  });
  const { companyInfo } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    const fetchAllWithdrawals = async () => {
      try {
        await dispatch(fetchWithdrawals()).unwrap();
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to fetch withdrawals';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (withdrawals.length === 0) {
      fetchAllWithdrawals();
    }
  }, [dispatch, withdrawals.length]);

  const withdrawal = withdrawals.find(
    (w: IFundTransaction) => w._id === withdrawalId,
  );
  const companyCurrency = useCompanyCurrency();
  const handleAction = async (status: number) => {
    if (status === 2 && !reason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setIsWithdrawalUpdating({
      label: status === 1 ? 'approved' : 'cancelled',
      value: true,
    });
    try {
      const formData = { status, reason: status === 2 ? reason : '' };
      await dispatch(
        updateWithdrawalRequestAsync({ id: withdrawalId as string, formData }),
      ).unwrap();
      toast.success('Withdrawal updated successfully.');
      if (status === 2) setReason('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update withdrawal');
    } finally {
      setIsWithdrawalUpdating({
        label: status === 1 ? 'approved' : 'cancelled',
        value: false,
      });
    }
  };

  const renderSkeleton = () => (
    <tbody>
      {[...Array(6)].map((_, idx) => (
        <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
          <td className="px-4 py-2 w-1/3">
            <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600" />
          </td>
          <td className="px-2 py-2 w-4">
            <div className="h-4 w-2 bg-gray-200 rounded animate-pulse dark:bg-gray-600" />
          </td>
          <td className="px-4 py-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <>
      <Breadcrumb pageName="Edit Withdrawal" />
      <div className="container mx-auto mt-6 px-4">
        {error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Withdrawal Details */}
            <div className="col-span-1 lg:col-span-2">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h5 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
                  Withdrawal Details
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-600">
                    <tbody>
                      {isLoading ? (
                        renderSkeleton()
                      ) : withdrawal ? (
                        <>
                          {[
                            [
                              'User',
                              withdrawal.uCode?.username
                                ? `${withdrawal.uCode.username}${
                                    withdrawal.uCode.name
                                      ? ` (${withdrawal.uCode.name})`
                                      : ''
                                  }`
                                : 'N/A',
                            ],
                            [
                              'Amount',
                              `${companyCurrency}${withdrawal.amount}`,
                            ],
                            [
                              'Tx Charge',
                              `${companyCurrency}${withdrawal.txCharge}`,
                            ],
                            ['Date', formatDate(withdrawal.createdAt)],
                          ].map(([label, value], idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 dark:border-gray-700"
                            >
                              <th className="text-left px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 w-1/3">
                                {label}
                              </th>
                              <td className="px-2 py-2 text-gray-700 dark:text-gray-300 w-4 text-center">
                                :
                              </td>
                              <td className="px-4 py-2 text-base text-gray-900 dark:text-white">
                                {value}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <th className="text-left px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                              Status
                            </th>
                            <td className="px-2 py-2 text-gray-700 dark:text-gray-300 w-4 text-center">
                              :
                            </td>
                            <td className="px-4 py-2">
                              {(() => {
                                let label = 'Cancelled';
                                let bgColor = 'bg-red-500';
                                if (withdrawal.status === 0) {
                                  label = 'Pending';
                                  bgColor = 'bg-orange-500';
                                } else if (withdrawal.status === 1) {
                                  label = 'Approved';
                                  bgColor = 'bg-green-500';
                                }
                                return (
                                  <span
                                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${bgColor}`}
                                  >
                                    {label}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                          {withdrawal.status === 2 && (
                            <tr>
                              <th className="text-left px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                Reason
                              </th>
                              <td className="px-2 py-2 text-gray-700 dark:text-gray-300 w-4 text-center">
                                :
                              </td>
                              <td className="px-4 py-2 text-base text-gray-900 dark:text-white">
                                {withdrawal.reason || 'N/A'}
                              </td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-4 text-gray-500 dark:text-gray-400"
                          >
                            No withdrawal found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Withdrawal Account Details */}
            <div className="col-span-1 lg:col-span-2">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h5 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
                  Withdrawal Account Details
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-600">
                    <tbody>
                      {withdrawal && typeof withdrawal.response === 'string' ? (
                        (() => {
                          try {
                            const parsed = JSON.parse(withdrawal.response);
                            const details =
                              parsed.details ||
                              parsed.withdrawalAccount?.details;

                            if (!details || typeof details !== 'object') {
                              return (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                                  >
                                    User doesn’t have a withdrawal account
                                  </td>
                                </tr>
                              );
                            }

                            return Object.entries(details).map(
                              ([key, value]: any, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-100 dark:border-gray-700"
                                >
                                  <th className="text-left px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 capitalize w-1/3">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </th>
                                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300 w-4 text-center">
                                    :
                                  </td>
                                  <td className="px-4 py-2 text-base text-gray-900 dark:text-white break-words">
                                    {value}
                                  </td>
                                </tr>
                              ),
                            );
                          } catch (err) {
                            console.error(
                              'Invalid JSON in withdrawal.response:',
                              err,
                            );
                            return (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="text-center py-4 text-red-500 dark:text-red-400"
                                >
                                  Invalid withdrawal data
                                </td>
                              </tr>
                            );
                          }
                        })()
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-4 text-gray-500 dark:text-gray-400"
                          >
                            User doesn’t have a withdrawal account
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Panel with Loader */}
            <div className="col-span-1">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-4">
                  <label
                    htmlFor="reason"
                    className="block text-sm font-semibold text-gray-700 !mb-2 dark:text-gray-300"
                  >
                    Reason (Required for cancellation)
                  </label>
                  <textarea
                    id="reason"
                    className="w-full rounded border border-gray-200 bg-white py-3 px-4 text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter cancellation reason..."
                    rows={3}
                    disabled={isWithdrawalUpdating.value}
                  />
                </div>
                {isWithdrawalUpdating.value ? (
                  <div className="flex justify-center items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse dark:bg-gray-600"></div>
                      <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse dark:bg-gray-600 delay-150"></div>
                      <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse dark:bg-gray-600 delay-300"></div>
                    </div>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      Updating...
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-center"
                      onClick={() => handleAction(1)}
                      disabled={withdrawal?.status === 1}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-center"
                      onClick={() => handleAction(2)}
                      disabled={withdrawal?.status === 2}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewWithdrawal;
