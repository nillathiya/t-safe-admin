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
  const [txNumber, setTxNumber] = useState<string>('');
  const [responseStr, setResponseStr] = useState<string>('');
  const [responseEditMode, setResponseEditMode] = useState<boolean>(false);
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

  // Pre-fill editable fields when withdrawal loads
  useEffect(() => {
    if (withdrawal) {
      setTxNumber(withdrawal.txNumber || '');
      setResponseStr(withdrawal.response || '');
    }
  }, [withdrawal?._id]);

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
      const formData: {
        status: number;
        reason: string;
        txNumber?: string;
        response?: string;
      } = { status, reason: status === 2 ? reason : '' };

      if (txNumber.trim()) formData.txNumber = txNumber.trim();
      if (responseStr.trim()) formData.response = responseStr.trim();

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

  /** Save only txNumber + response without changing status */
  const handleSaveFields = async () => {
    setIsWithdrawalUpdating({ label: 'saving', value: true });
    try {
      const formData: {
        status: number;
        reason: string;
        txNumber?: string;
        response?: string;
      } = {
        status: withdrawal?.status ?? 0,
        reason: withdrawal?.reason || '',
        txNumber: txNumber.trim(),
        response: responseStr.trim(),
      };
      await dispatch(
        updateWithdrawalRequestAsync({ id: withdrawalId as string, formData }),
      ).unwrap();
      toast.success('Fields saved successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save fields');
    } finally {
      setIsWithdrawalUpdating({ label: 'saving', value: false });
    }
  };

  /** Try to pretty-print JSON; returns null if not valid JSON */
  const parsedResponse = (() => {
    if (!responseStr.trim()) return null;
    try {
      return JSON.parse(responseStr.trim());
    } catch {
      return null;
    }
  })();

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

  /** Recursively render a JSON value — objects render as nested tables */
  const renderJsonValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">null</span>;
    if (typeof value === 'boolean') return <span className="text-purple-500 font-semibold">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-blue-500">{value}</span>;
    if (typeof value === 'string') return <span className="break-all">{value}</span>;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400 italic">[]</span>;
      return (
        <ul className="list-disc list-inside ml-2 space-y-1">
          {value.map((item, i) => (
            <li key={i}>{renderJsonValue(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object') {
      return (
        <table className="w-full border border-gray-200 dark:border-gray-600 mt-1 rounded">
          <tbody>
            {Object.entries(value).map(([k, v], i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-3 py-1.5 font-semibold text-xs text-gray-600 dark:text-gray-400 capitalize w-1/3 align-top">
                  {k.replace(/([A-Z])/g, ' $1').trim()}
                </th>
                <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400 w-4 text-center">:</td>
                <td className="px-3 py-1.5 text-sm text-gray-900 dark:text-white">{renderJsonValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <span>{String(value)}</span>;
  };

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

            {/* Action Panel */}
            <div className="col-span-1">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                {/* Reason */}
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

                {/* Tx Hash / Number */}
                <div className="mb-4">
                  <label
                    htmlFor="txNumber"
                    className="block text-sm font-semibold text-gray-700 !mb-2 dark:text-gray-300"
                  >
                    Tx Hash / Number
                  </label>
                  <input
                    id="txNumber"
                    type="text"
                    className="w-full rounded border border-gray-200 bg-white py-2.5 px-4 text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500 font-mono text-sm"
                    value={txNumber}
                    onChange={(e) => setTxNumber(e.target.value)}
                    placeholder="e.g. 0xabc123..."
                    disabled={isWithdrawalUpdating.value}
                  />
                </div>

                {/* Response / JSON */}
                <div className="mb-4">
                  <div className="flex items-center justify-between !mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tx Response
                    </label>
                    {/* toggle only shown when there is a valid JSON */}
                    {parsedResponse && (
                      <button
                        type="button"
                        onClick={() => setResponseEditMode((m) => !m)}
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 underline"
                      >
                        {responseEditMode ? 'View parsed' : 'Edit raw'}
                      </button>
                    )}
                  </div>

                  {/* Show parsed key/value table when valid JSON and NOT in edit mode */}
                  {parsedResponse && !responseEditMode ? (
                    <div className="border border-gray-200 dark:border-gray-600 rounded overflow-auto max-h-64">
                      <table className="w-full text-sm">
                        <tbody>
                          {Object.entries(parsedResponse).map(([k, v]: [string, any], i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700 align-top">
                              <th className="text-left px-3 py-1.5 font-semibold text-xs text-gray-600 dark:text-gray-400 capitalize whitespace-nowrap w-1/3">
                                {k.replace(/([A-Z])/g, ' $1').trim()}
                              </th>
                              <td className="px-1 py-1.5 text-gray-400 w-3 text-center">:</td>
                              <td className="px-3 py-1.5 text-gray-900 dark:text-white break-all">
                                {typeof v === 'object' && v !== null
                                  ? <pre className="text-xs whitespace-pre-wrap font-mono">{JSON.stringify(v, null, 2)}</pre>
                                  : typeof v === 'boolean'
                                  ? <span className={`font-semibold ${v ? 'text-green-500' : 'text-red-500'}`}>{v.toString()}</span>
                                  : String(v ?? '')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Raw textarea — always shown when invalid JSON or in edit mode */
                    <>
                      <textarea
                        id="responseStr"
                        className="w-full rounded border border-gray-200 bg-white py-2.5 px-4 text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500 font-mono text-xs"
                        value={responseStr}
                        onChange={(e) => setResponseStr(e.target.value)}
                        placeholder='{"success":true,"message":"..."}'
                        rows={5}
                        disabled={isWithdrawalUpdating.value}
                      />
                      {responseStr.trim() && !parsedResponse && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠ Invalid JSON — will be saved as plain text
                        </p>
                      )}
                    </>
                  )}
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
                  <div className="flex flex-col gap-3">
                    {/* Save fields only */}
                    <button
                      type="button"
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-center text-sm"
                      onClick={handleSaveFields}
                    >
                      Save Tx Hash &amp; Response
                    </button>

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
                  </div>
                )}
              </div>
            </div>

            {/* Tx Response Details (full JSON display) */}
            <div className="col-span-1 lg:col-span-3">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h5 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
                  Tx Response Details
                </h5>

                {/* Tx Hash quick display */}
                {withdrawal?.txNumber && (
                  <div className="mb-4 flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Tx Hash:
                    </span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {withdrawal.txNumber}
                    </span>
                  </div>
                )}

                {withdrawal && typeof withdrawal.response === 'string' && withdrawal.response.trim() ? (
                  (() => {
                    try {
                      const parsed = JSON.parse(withdrawal.response.trim());
                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-200 dark:border-gray-600 rounded">
                            <tbody>
                              {Object.entries(parsed).map(([key, value], index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-100 dark:border-gray-700 align-top"
                                >
                                  <th className="text-left px-4 py-2.5 font-semibold text-sm text-gray-700 dark:text-gray-300 capitalize w-1/5 align-top">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </th>
                                  <td className="px-2 py-2.5 text-gray-700 dark:text-gray-300 w-4 text-center">
                                    :
                                  </td>
                                  <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-white">
                                    {renderJsonValue(value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    } catch {
                      // Not valid JSON — show plain text
                      return (
                        <pre className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-600 whitespace-pre-wrap break-all">
                          {withdrawal.response}
                        </pre>
                      );
                    }
                  })()
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No response data available for this withdrawal.
                  </p>
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
