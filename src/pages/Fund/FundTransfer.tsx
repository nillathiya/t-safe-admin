import React, { useState, useRef, useEffect } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { DEFAULT_PER_PAGE_ITEMS } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import { getAdminFundTransactionAsync } from '../../features/transaction/transactionSlice';

const FundTransfer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminFundTransactions, isLoading } = useSelector(
    (state: RootState) => state.transaction,
  );
  const tableRef = useRef<HTMLTableElement>(null);
  const { companyInfo } = useSelector((state: RootState) => state.settings);

  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
    ?.value;
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = { txType: 'direct_fund_transfer' };
        await dispatch(getAdminFundTransactionAsync(params));
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      }
    };

    fetchTransactions();
  }, [dispatch]);

  useEffect(() => {
    if (!tableRef.current || isLoading || adminFundTransactions.length === 0)
      return;

    setTimeout(() => {
      const $table = $(tableRef.current as HTMLTableElement);

      // Ensure DataTable is initialized only once
      if (!($table as any).DataTable.isDataTable(tableRef.current)) {
        ($table as any).DataTable({
          paging: true,
          ordering: true,
          info: true,
          responsive: true,
          searching: true,
          pageLength: DEFAULT_PER_PAGE_ITEMS,
        });

        // Mark DataTable initialization
        if (tableRef.current) tableRef.current.dataset.dtInstance = 'true';
      }
    }, 300);
  }, [adminFundTransactions, isLoading]);

  return (
    <div>
      <Breadcrumb pageName="Fund Transfer" />
      <div className="table-bg">
        <div className="card-body overflow-x-auto">
          <table ref={tableRef} className="table bordered-table display">
            <thead>
              <tr>
                <th className="table-header">S No.</th>
                <th className="table-header">USER</th>
                <th className="table-header">Amount({companyCurrency})</th>
                <th className="table-header">WALLET TYPE</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(null)
                  .map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array(13)
                        .fill(null)
                        .map((_, cellIndex) => (
                          <td key={cellIndex}>
                            <Skeleton width="100%" height="20px" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : adminFundTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No Transaction found
                  </td>
                </tr>
              ) : (
                adminFundTransactions.map((tx: any, index) => (
                  <tr key={index}>
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">
                      {tx.txUCode?.username
                        ? tx.txUCode.name
                          ? `${tx.txUCode.username} (${tx.txUCode.name})`
                          : tx.txUCode.username
                        : 'N/A'}
                    </td>
                    <td className="table-cell">
                      {companyCurrency}
                      {tx.amount || 'N/A'}
                    </td>
                    <td className="table-cell">{tx.walletType || 'N/A'}</td>

                    <td className="table-cell">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FundTransfer;
