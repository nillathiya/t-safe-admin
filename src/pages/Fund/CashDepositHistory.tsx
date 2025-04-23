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
import { useCompanyCurrency, useCompanyInfo } from '../../hooks/useCompanyInfo';

const CashDepositHistory: React.FC = () => {
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
  const companyCurrency = useCompanyCurrency();
  const transactionDetailModelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideModel = (e: MouseEvent) => {
      if (
        transactionDetailModelRef.current &&
        !transactionDetailModelRef.current.contains(e.target as Node)
      ) {
        setSelectedTransaction(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideModel);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideModel);
    };
  }, []);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsInitialLoading(true);
        const params = {
          txType: FUND_TX_TYPE.FUND_ADD,
          status: '1,2',
          depositAccountType: 'cash',
        };
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
      <Breadcrumb pageName="Cash Deposit History" />
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
                    Cash Deposit History Not Found
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
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm mt-15">
              <div
                ref={transactionDetailModelRef}
                className=" bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden transform transition-all duration-300 scale-100 hover:scale-105"
              >
                <h3 className="text-2xl font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 text-gray-900 dark:text-white tracking-tight">
                  Transaction Details
                </h3>

                <div className="space-y-5 text-gray-700 dark:text-gray-200">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Username
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {selectedTransaction.uCode?.username || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Amount
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedTransaction.amount !== undefined &&
                      selectedTransaction.amount !== null
                        ? `${companyCurrency}${selectedTransaction.amount.toFixed(
                            2,
                          )}`
                        : 'N/A'}
                    </span>
                  </div>
                  {selectedTransaction.response &&
                    Object.entries(JSON.parse(selectedTransaction.response))
                      .filter(([key]) => !['amount'].includes(key))
                      .map(([key, value], index) => (
                        <div
                          className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          key={index}
                        >
                          <span className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                            {key || 'N/A'}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300 truncate">
                            {String(value) || 'N/A'}
                          </span>
                        </div>
                      ))}

                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Status
                    </span>
                    <span
                      className={`${getStatusColor(
                        selectedTransaction.status,
                      )} font-semibold px-3 py-1 rounded-full text-sm`}
                    >
                      {getStatusText(selectedTransaction.status)}
                    </span>
                  </div>
                  <div className="flex flex-col p-3">
                    <span className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Payment Slip:
                    </span>
                    <div className="overflow-hidden rounded-lg w-full">
                      {renderPaymentSlip(selectedTransaction.paymentSlip)}
                    </div>
                  </div>
                </div>

                {selectedTransaction.status === 0 && showRejectReason && (
                  <div className="mt-6">
                    <label
                      htmlFor="rejectReason"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                    >
                      Reason for Rejection
                    </label>
                    <textarea
                      id="rejectReason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 transition-all duration-200"
                      rows={4}
                      placeholder="Enter reason for rejection"
                    />
                  </div>
                )}

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col gap-4 text-center">
                  {selectedTransaction.status === 0 && (
                    <>
                      <button
                        onClick={handleApprove}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all duration-200 transform hover:-translate-y-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          showRejectReason
                            ? handleReject()
                            : setShowRejectReason(true)
                        }
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-all duration-200 transform hover:-translate-y-1"
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
                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all duration-200 transform hover:-translate-y-1"
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
              aria-labelledby="payment-slip-preview"
            >
              <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm top-10">
                <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden transform transition-all duration-300 scale-100 hover:scale-105">
                  <img
                    src={
                      selectedTransaction.paymentSlip.startsWith('http')
                        ? selectedTransaction.paymentSlip
                        : `${API_URL}${selectedTransaction.paymentSlip}`
                    }
                    alt="Payment Slip Fullscreen"
                    className="w-full h-auto max-w-full max-h-[90vh] rounded-md object-contain"
                  />
                  <button
                    onClick={() => setIsImageOpen(false)}
                    className="fixed w-10 h-10 top-2 right-2 p-2 bg-gray-900/80 dark:bg-gray-800/80 text-white rounded-full hover:bg-gray-700/90 focus:outline-none focus:ring-2 focus:ring-white z-50 backdrop-blur-sm text-center"
                    aria-label="Close image preview"
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

export default CashDepositHistory;
