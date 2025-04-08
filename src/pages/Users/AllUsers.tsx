import React, { useEffect, useMemo, useRef, useState } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-dt/js/dataTables.dataTables.js';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getAllUserAsync,
  updateUserStatusAsync,
} from '../../features/user/userSlice';
import { DEFAULT_PER_PAGE_ITEMS, USER_API_URL } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { getAllOrdersAsync } from '../../features/order/orderSlice';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import { requestImpersonationTokenAsync } from '../../features/auth/authSlice';

const AllUsers: React.FC = () => {
  const { users, updateUsers } = useSelector((state: RootState) => state.user);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch<AppDispatch>();
  const tableRef = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState<{ index: number; value: boolean }>({
    index: 0,
    value: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await dispatch(getAllUserAsync()).unwrap();
      await dispatch(getAllOrdersAsync()).unwrap();
    } catch (error: any) {
      toast.error(error?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, users.length]);

  useEffect(() => {
    console.log('1');
    const tableElement = tableRef.current;
    if (!tableElement || isLoading || users.length === 0) return;
    console.log('2');

    let tableInstance: any; // Store DataTable instance
    const timer = setTimeout(() => {
      const $table = $(tableElement);

      // Destroy existing DataTable if initialized
      if ($.fn.dataTable.isDataTable(tableElement)) {
        $table.DataTable().destroy();
      }

      // Reinitialize DataTable
      tableInstance = $table.DataTable({
        paging: true,
        ordering: true,
        info: true,
        responsive: true,
        searching: true,
        pageLength: DEFAULT_PER_PAGE_ITEMS,
      });
    }, 300); // Delay for DOM stability

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (tableInstance && $.fn.dataTable.isDataTable(tableElement)) {
        tableInstance.destroy();
      }
    };
  }, [users, isLoading]);

  const handleRefresh = async () => {
    fetchData();
  };

  const handleToggleStatus = async (
    userId: string,
    currentStatus: number,
    currentBlockStatus: number,
  ) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

      await dispatch(
        updateUserStatusAsync({
          userId,
          accountStatus: {
            activeStatus: newStatus,
            blockStatus: currentBlockStatus,
          }, // ✅ Keep blockStatus unchanged
        }),
      ).unwrap();

      toast.success('User active status updated successfully');
    } catch (error: any) {
      console.error('Error updating user active status:', error);
      toast.error('Failed to update user active status');
    }
  };

  const handleToggleBlock = async (
    userId: string,
    isBlocked: boolean,
    currentStatus: number,
  ) => {
    try {
      await dispatch(
        updateUserStatusAsync({
          userId,
          accountStatus: {
            blockStatus: isBlocked ? 0 : 1,
            activeStatus: currentStatus,
          }, // ✅ Keep activeStatus unchanged
        }),
      ).unwrap();

      toast.success('User block status updated successfully');
    } catch (error: any) {
      console.error('Error updating user block status:', error);
      toast.error('Failed to update user block status');
    }
  };

  const updatedUsers = useMemo(() => {
    if (users.length > 0) {
      return users.map((user) => {
        const userId = user._id;
        const userOrders = orders.filter((or) => or.customerId?._id === userId);
        const totalInvestment = userOrders.reduce(
          (acc, or) => acc + (or.bv || 0),
          0,
        );
        return {
          ...user,
          package: totalInvestment || 0,
        };
      });
    }
    return [];
  }, [users, orders]);

  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/users/edituser/${id}`);
  };

  const handleRequestImpersonationToken = async (userId: string) => {
    try {
      const response = await dispatch(
        requestImpersonationTokenAsync(userId),
      ).unwrap();
      console.log('response', response);
      if (response.success) {
        const token = response.data;
        const userAppURL = `${USER_API_URL}?impersonate=${token}`;
        window.open(userAppURL, '_blank');
      } else {
        toast.error('Failed to request user login');
      }
    } catch (error: any) {
      toast.error(error || 'unexpected error occurred');
    }
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
                <Icon Icon={ICONS.REFRESH} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
          <table ref={tableRef} className="table bordered-table display">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Action</th>
                <th className="table-header">Sponsor</th>
                <th className="table-header">Name</th>
                <th className="table-header">Username</th>
                <th className="table-header">Email</th>
                <th className="table-header">Mobile</th>
                <th className="table-header">My Package</th>
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
              ) : updatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                updatedUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="table-cell"> {index + 1}</td>
                    <td className="flex gap-2 ">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        onClick={() => handleEdit(user._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        onClick={() =>
                          handleRequestImpersonationToken(user._id)
                        }
                      >
                        Login
                      </button>
                    </td>
                    <td className="table-cell">
                      {' '}
                      {user.uSponsor?.username
                        ? user.uSponsor.name
                          ? `${user.uSponsor.username} (${user.uSponsor.name})`
                          : user.uSponsor.username
                        : 'N/A'}
                    </td>
                    <td className="table-cell"> {user.name || 'N/A'}</td>
                    <td className="table-cell"> {user.username || 'N/A'}</td>
                    <td className="table-cell"> {user.email || 'N/A'}</td>
                    <td className="table-cell"> {user.mobile || 'N/A'}</td>
                    <td className="table-cell"> {user.package || 0}</td>
                    <td className="table-cell"> {user.myRank || 0}</td>
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
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={user.accountStatus?.activeStatus === 1}
                          onChange={() =>
                            handleToggleStatus(
                              user._id,
                              user.accountStatus.activeStatus,
                              user.accountStatus.blockStatus,
                            )
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={user.accountStatus?.blockStatus === 1}
                          onChange={() =>
                            handleToggleBlock(
                              user._id,
                              user.accountStatus.blockStatus === 1,
                              user.accountStatus.activeStatus,
                            )
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>
        {`
          .switch {
            position: relative;
            display: inline-block;
            width: 34px;
            height: 20px;
          }
          
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 20px;
          }
          
          .slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          input:checked + .slider {
            background-color: #4caf50;
          }
          
          input:checked + .slider:before {
            transform: translateX(14px);
          }
        `}
      </style>
    </>
  );
};

export default AllUsers;
