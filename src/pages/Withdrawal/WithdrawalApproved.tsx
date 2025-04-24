import React, { useRef } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import '../../../src/pages/Withdrawal/withdrawal.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWithdrawals,
  selectApprovedWithdrawals,
} from '../../features/withdrawal/withdrawalSlice';
import { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PER_PAGE_ITEMS } from '../../constants';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import { useCompanyCurrency } from '../../hooks/useCompanyInfo';

const WithdrawalApproved: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const approvedWithdrawals = useSelector(selectApprovedWithdrawals);
  const navigate = useNavigate();
  const { withdrawals, isLoading } = useSelector(
    (state: RootState) => state.withdrawal,
  );

  const companyCurrency = useCompanyCurrency();

  useEffect(() => {
    (async () => {
      try {
        if (withdrawals.length === 0) {
          await dispatch(fetchWithdrawals()).unwrap();
        }
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      }
    })();
  }, [dispatch, withdrawals]);

  const handleClick = (id: string) => {
    navigate(`/view-withdrawal/${id}`);
  };

  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current || isLoading || approvedWithdrawals.length === 0)
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
  }, [approvedWithdrawals, isLoading]);
  const handleRefresh = async () => {
    try {
      await dispatch(fetchWithdrawals()).unwrap();
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
  };
  return (
    <div>
      <Breadcrumb pageName="Pending Withdrwals" />
      <div className="table-bg">
        {/* Refresh button */}
        <div className="flex justify-end mb-2">
          <div className="w-15">
            <button onClick={handleRefresh} className="btn-refresh">
              <Icon Icon={ICONS.REFRESH} className="w-7 h-7" />
            </button>
          </div>
        </div>
        <div className="card-body overflow-x-auto">
          <table ref={tableRef} className="table bordered-table display">
            <thead>
              <tr>
                <th className="table-header"> S.No</th>
                <th className="table-header"> Tx user</th>
                <th className="table-header"> Amount</th>
                <th className="table-header"> Tx Charge</th>
                {/* <th className="table-header"> Withdrawal pool</th> */}
                <th className="table-header"> Payable Amount</th>
                <th className="table-header"> Withdrawal Account</th>
                {/* <th className="table-header"> TDS</th> */}
                <th className="table-header"> Status</th>
                <th className="table-header"> Date</th>
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
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                approvedWithdrawals.map((withdrawal: any, index: number) => (
                  <tr key={withdrawal._id}>
                    <td>{index + 1}</td>

                    <td className="table-cell">
                      {withdrawal.uCode?.username || 'N/A'}
                    </td>

                    <td className="table-cell">
                      {companyCurrency}
                      {(
                        (withdrawal.amount ?? 0) +
                        (withdrawal.txCharge ?? 0) +
                        (withdrawal.wPool ?? 0)
                      ).toFixed(2)}
                    </td>
                    <td className="table-cell">
                      {companyCurrency}
                      {withdrawal.txCharge}
                    </td>
                    {/* <td className="table-cell">
                      {withdrawal.wPool ? `${companyCurrency}${withdrawal.wPool}` : 0}
                    </td> */}
                    <td className="table-cell">
                      {companyCurrency}
                      {withdrawal.amount}
                    </td>
                    <td className="table-cell">
                      {(() => {
                        try {
                          const parsedResponse = JSON.parse(
                            withdrawal.response,
                          );
                          console.log('parsedResponse', parsedResponse);

                          const accountType = parsedResponse.accountTypeId;

                          if (accountType) {
                            if (
                              typeof accountType === 'object' &&
                              accountType.name
                            ) {
                              return accountType.name;
                            } else if (typeof accountType === 'string') {
                              return accountType; // Fallback if it's just an ID or string
                            }
                          }

                          return 'N/A'; // Fallback if no accountTypeId or no name
                        } catch (error) {
                          console.error(
                            'Failed to parse response JSON:',
                            error,
                          );
                          return 'Invalid data';
                        }
                      })()}
                    </td>
                    {/* <td className="table-cell">{withdrawal.tds || '0'}</td> */}
                    <td
                      className={`
                    table-cell
                        ${
                          withdrawal.status === 0
                            ? ' !text-yellow-700'
                            : withdrawal.status === 1
                            ? ' !text-green-700'
                            : ' !text-red-700'
                        }
                      `}
                    >
                      {withdrawal.status === 0
                        ? 'Pending'
                        : withdrawal.status === 1
                        ? 'Approved'
                        : 'Cancelled'}
                    </td>
                    <td className="table-cell">
                      {formatDate(withdrawal.createdAt)}
                    </td>
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
export default WithdrawalApproved;
