import React, { useState, useRef, useEffect } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { DEFAULT_PER_PAGE_ITEMS, FUND_TX_TYPE } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import {
  getFundTransactionsAsync,
  updateUserFundTransactionAsync,
} from '../../features/transaction/transactionSlice';
import { Dialog } from '@headlessui/react';
import {
  IFundTransaction,
  IUpdateUserFundTransactionPayload,
} from '../../types';
import { API_URL } from '../../api/routes';

const DepositRequest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fundTransactions, isLoading } = useSelector(
    (state: RootState) => state.transaction,
  );
  const tableRef = useRef<HTMLTableElement>(null);
  const { companyInfo } = useSelector((state: RootState) => state.settings);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<IFundTransaction | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false); // State for full-screen image preview
  const [showRejectReason, setShowRejectReason] = useState(false); // Toggle rejection reason input
  const [rejectReason, setRejectReason] = useState(''); // Rejection reason input

  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
    ?.value;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsInitialLoading(true);
        const params = { txType: FUND_TX_TYPE.FUND_ADD, status: 0 };
        await dispatch(getFundTransactionsAsync(params)).unwrap();
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchTransactions();
  }, [dispatch]);

  useEffect(() => {
    if (
      !tableRef.current ||
      isLoading ||
      isInitialLoading ||
      fundTransactions.length === 0
    ) {
      return;
    }

    const $table = $(tableRef.current as HTMLTableElement);

    setTimeout(() => {
      if (!($table as any).DataTable.isDataTable(tableRef.current)) {
        ($table as any).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          searching: true,
          pageLength: DEFAULT_PER_PAGE_ITEMS,
        });

        if (tableRef.current) tableRef.current.dataset.dtInstance = 'true';
      }
    }, 300);

    // return () => {
    //   if (
    //     tableRef.current &&
    //     ($table as any).DataTable.isDataTable(tableRef.current)
    //   ) {
    //     ($table as any).DataTable().destroy();
    //   }
    // };
  }, [fundTransactions, isLoading, isInitialLoading]);

  const renderSkeleton = () => (
    <>
      {Array(5)
        .fill(null)
        .map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array(8)
              .fill(null)
              .map((_, cellIndex) => (
                <td key={cellIndex}>
                  <Skeleton width="100%" height="20px" />
                </td>
              ))}
          </tr>
        ))}
    </>
  );

  // Status color and text mapping
  const getStatusColor = (status: number) => {
    return (
      {
        0: 'text-yellow-500 dark:text-yellow-400', // Pending
        1: 'text-green-500 dark:text-green-400', // Approved
        2: 'text-red-500 dark:text-red-400', // Rejected
        3: 'text-gray-500 dark:text-gray-400', // Cancelled
        4: 'text-orange-500 dark:text-orange-400', // Failed
      }[status] || 'text-gray-500 dark:text-gray-400'
    );
  };

  const getStatusText = (status: number) => {
    return (
      {
        0: 'Pending',
        1: 'Approved',
        2: 'Rejected',
        3: 'Cancelled',
        4: 'Failed',
      }[status] || 'N/A'
    );
  };

  // Handle Approve
  const handleApprove = async () => {
    if (!selectedTransaction) return;
    try {
      const formData: IUpdateUserFundTransactionPayload = {
        status: 1,
      };
      await dispatch(
        updateUserFundTransactionAsync({
          id: selectedTransaction._id,
          formData,
        }),
      ).unwrap();
      toast.success('Transaction approved successfully');
      setSelectedTransaction(null);
      const params = { txType: FUND_TX_TYPE.FUND_ADD, status: 0 };
      await dispatch(getFundTransactionsAsync(params)).unwrap();
    } catch (error: any) {
      toast.error(error || 'Failed to approve transaction');
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!selectedTransaction) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      const formData: IUpdateUserFundTransactionPayload = {
        status: 2,
        reason: rejectReason,
      };
      await dispatch(
        updateUserFundTransactionAsync({
          id: selectedTransaction._id,
          formData,
        }),
      ).unwrap();
      toast.success('Transaction rejected successfully');
      setSelectedTransaction(null);
      setRejectReason('');
      setShowRejectReason(false);
      const params = { txType: FUND_TX_TYPE.FUND_ADD, status: 0 };
      await dispatch(getFundTransactionsAsync(params)).unwrap();
    } catch (error: any) {
      toast.error(error || 'Failed to reject transaction');
    }
  };

  // Helper to determine file type and render paymentSlip
  const renderPaymentSlip = (paymentSlip?: string) => {
    if (!paymentSlip) {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          No slip uploaded
        </span>
      );
    }

    const fileExtension = paymentSlip.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension || '');
    const isPdf = fileExtension === 'pdf';
    const fileUrl = paymentSlip.startsWith('http')
      ? paymentSlip
      : `${API_URL}${paymentSlip}`;

    if (isImage) {
      return (
        <img
          src={fileUrl}
          alt="Payment Slip"
          className="w-32 h-32 object-cover rounded-md shadow-md cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsImageOpen(true)}
        />
      );
    }

    if (isPdf) {
      return (
        <div className="flex flex-col gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View PDF
          </a>
          <iframe
            src={fileUrl}
            title="Payment Slip PDF"
            className="w-32 h-32 rounded-md shadow-md"
          />
        </div>
      );
    }

    return (
      <a
        href={fileUrl}
        download
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Download File
      </a>
    );
  };

  return (
    <div>
      <Breadcrumb pageName="Fund Transfer" />
      <div className="table-bg">
        <div className="card-body overflow-x-auto">
          <table ref={tableRef} className="table bordered-table display">
            <thead>
              <tr>
                <th className="table-header">S No.</th>
                <th className="table-header">Action</th>
                <th className="table-header">USER</th>
                <th className="table-header">Amount({companyCurrency})</th>
                <th className="table-header">Method</th>
                <th className="table-header">Account</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {isInitialLoading || isLoading ? (
                renderSkeleton()
              ) : fundTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No Transaction found
                  </td>
                </tr>
              ) : (
                fundTransactions.map((tx: any, index) => (
                  <tr key={index}>
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">
                      <div>
                        <button
                          className="btn-green-filled p-2"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      {tx.uCode?.username
                        ? tx.uCode.name
                          ? `${tx.uCode.username} (${tx.uCode.name})`
                          : tx.uCode.username
                        : 'N/A'}
                    </td>
                    <td className="table-cell">
                      {companyCurrency}
                      {tx.amount ?? 'N/A'}
                    </td>
                    <td className="table-cell">{tx.method?.name || 'N/A'}</td>
                    <td className="table-cell">{tx.account?.name || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={getStatusColor(tx.status)}>
                        {getStatusText(tx.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {tx.createdAt ? formatDate(tx.createdAt) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <>
          <Dialog
            open={!!selectedTransaction}
            onClose={() => {
              setSelectedTransaction(null);
              setShowRejectReason(false);
              setRejectReason('');
            }}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg mx-4 transform transition-all">
                <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  Transaction Details
                </h3>

                <div className="space-y-4 text-gray-900 dark:text-gray-100">
                  <div className="flex justify-between">
                    <span className="font-medium">Username:</span>
                    <span>{selectedTransaction.uCode?.username || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>
                      {selectedTransaction.amount !== undefined &&
                      selectedTransaction.amount !== null
                        ? `${companyCurrency}${selectedTransaction.amount.toFixed(
                            2,
                          )}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction Number:</span>
                    <span>{selectedTransaction.txNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`${getStatusColor(
                        selectedTransaction.status,
                      )} font-semibold`}
                    >
                      {getStatusText(selectedTransaction.status)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium mb-2">Payment Slip:</span>
                    {renderPaymentSlip(selectedTransaction.paymentSlip)}
                  </div>
                </div>

                {selectedTransaction.status === 0 && showRejectReason && (
                  <div className="mt-4">
                    <label
                      htmlFor="rejectReason"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Reason for Rejection
                    </label>
                    <textarea
                      id="rejectReason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      rows={3}
                      placeholder="Enter reason for rejection"
                    />
                  </div>
                )}

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3">
                  {selectedTransaction.status === 0 && (
                    <>
                      <button
                        onClick={handleApprove}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          showRejectReason
                            ? handleReject()
                            : setShowRejectReason(true)
                        }
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        {showRejectReason ? 'Submit Rejection' : 'Reject'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTransaction(null);
                      setShowRejectReason(false);
                      setRejectReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Dialog>

          {/* Full-Screen Image Preview (for images only) */}
          {isImageOpen && selectedTransaction?.paymentSlip && (
            <Dialog
              open={isImageOpen}
              onClose={() => setIsImageOpen(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
                <div className="relative">
                  <img
                    src={
                      selectedTransaction.paymentSlip.startsWith('http')
                        ? selectedTransaction.paymentSlip
                        : `${API_URL}${selectedTransaction.paymentSlip}`
                    }
                    alt="Payment Slip Fullscreen"
                    className="max-w-full max-h-[90vh] rounded-md"
                  />
                  <button
                    onClick={() => setIsImageOpen(false)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
};

export default DepositRequest;
