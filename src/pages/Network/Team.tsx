import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAllUserAsync } from '../../features/user/userSlice';
import { DEFAULT_PER_PAGE_ITEMS } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import { useNavigate } from 'react-router-dom';

function Team() {
  const { users, isLoading } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const tableRef = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState<{ index: number; value: boolean }>({
    index: 0,
    value: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (users.length == 0) {
          await dispatch(getAllUserAsync()).unwrap();
        }
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (tableRef.current && !isLoading && users.length > 0) {
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
    }
  }, [users]);

  const handleRefresh = async () => {
    try {
      await dispatch(getAllUserAsync()).unwrap();
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
  };

  const handleViewUserGeneration = (userId: string) => {
    navigate(`/network/team/user/${userId}`);
  };

  const handleCopy = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopied({ index, value: true });
    setTimeout(() => setCopied({ index, value: false }), 1500);
  };
  return (
    <>
      <Breadcrumb pageName="All Users" />
      <div className="table-bg">
        <div className="card-body overflow-x-auto">
          {/* Refresh button */}
          <div className="flex justify-end mb-2">
            <div className="w-15">
              <button onClick={handleRefresh} className="btn-refresh">
                <Icon Icon={ICONS.REFRESH} className="w-5 h-5 sm:w-6 sm:h-6" />{' '}
              </button>
            </div>
          </div>
          <table ref={tableRef} className="table bordered-table display">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Action</th>
                <th className="table-header">Name</th>
                <th className="table-header">Username</th>
                <th className="table-header">Email</th>
                <th className="table-header">Mobile</th>
                <th className="table-header">Sponsor</th>
                <th className="table-header">My Rank</th>
                <th className="table-header">User Address</th>
                <th className="table-header">Join Date</th>
                <th className="table-header">Active Status</th>
                <th className="table-header">Block Status</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={index}>
                    <td className="table-cell"> {index + 1}</td>
                    <td className="flex gap-2 ">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        onClick={() => handleViewUserGeneration(user._id)}
                      >
                        View
                      </button>
                    </td>

                    <td className="table-cell"> {user.name || 'N/A'}</td>
                    <td className="table-cell"> {user.username || 'N/A'}</td>
                    <td className="table-cell"> {user.email || 'N/A'}</td>
                    <td className="table-cell"> {user.mobile || 'N/A'}</td>
                    <td className="table-cell">
                      {' '}
                      {user.uSponsor?.username
                        ? user.uSponsor.name
                          ? `${user.uSponsor.username} (${user.uSponsor.name})`
                          : user.uSponsor.username
                        : 'N/A'}
                    </td>

                    <td className="table-cell"> {user.myRank || 'N/A'}</td>

                    <td className="table-cell">
                      <div className="flex gap-2 items-center">
                        {user.walletAddress
                          ? `${user.walletAddress.slice(
                              0,
                              15,
                            )}...${user.walletAddress.slice(-4)}`
                          : 'N/A'}

                        <div
                          onClick={() => handleCopy(user.walletAddress, index)}
                        >
                          {copied.index === index && copied.value == true ? (
                            <span className="text-green-700">Copied</span>
                          ) : (
                            <Icon Icon={ICONS.COPY} className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {' '}
                      {formatDate(user.createdAt)}
                    </td>
                    <td
                      className={`!font-semibold 
                      ${
                        user.accountStatus.activeStatus == 1
                          ? '!text-green-600 dark:!text-green-400'
                          : '!text-red-600 dark:!text-red-400'
                      }`}
                    >
                      {user.accountStatus.activeStatus == 1
                        ? 'Active'
                        : 'Inactive'}
                    </td>
                    <td
                      className={`!font-semibold 
      ${
        user.isBlocked
          ? '!text-red-500 !dark:text-red-400'
          : '!text-green-600 !dark:text-green-400'
      }`}
                    >
                      {user.isBlocked ? 'Blocked' : 'Unblocked'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Team;
