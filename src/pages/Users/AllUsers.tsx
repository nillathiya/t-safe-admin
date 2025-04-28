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
      await Promise.all([
        dispatch(getAllUserAsync()).unwrap(),
        dispatch(getAllOrdersAsync()).unwrap(),
      ]);
      toast.success('Data refreshed successfully');
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error?.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const handleRefresh = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error('Refresh error:', error);
    }
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
          },
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
          },
        }),
      ).unwrap();
      toast.success('User block status updated successfully');
    } catch (error: any) {
      console.error('Error updating user block status:', error);
      toast.error('Failed to update user block status');
    }
  };

  const updatedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
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
  }, [users, orders]);
  const navigate = useNavigate();
  useEffect(() => {
    if (!tableRef.current || isLoading || updatedUsers.length === 0) return;

    const tableElement = tableRef.current;
    let tableInstance: any;

    // Initialize DataTable
    const initializeDataTable = () => {
      const $table = $(tableElement);

      // Check if DataTable is already initialized
      if ($.fn.dataTable.isDataTable(tableElement)) {
        // Destroy existing DataTable safely
        try {
          $table.DataTable().clear().destroy();
        } catch (error) {
          console.warn('Error destroying DataTable:', error);
        }
      }

      // Initialize DataTable
      tableInstance = $table.DataTable({
        paging: true,
        ordering: true,
        info: true,
        responsive: true,
        searching: true,
        pageLength: DEFAULT_PER_PAGE_ITEMS,
        data: updatedUsers,
        columns: [
          { data: null, render: (_, __, ___, meta) => meta.row + 1 },
          {
            data: '_id',
            render: (id) => `
              <div class="flex gap-2">
                <button class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition edit-btn" data-id="${id}">Edit</button>
                <button class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition login-btn" data-id="${id}">Login</button>
              </div>
            `,
          },
          {
            data: 'sponsorUCode',
            render: (sponsor) =>
              sponsor?.username
                ? sponsor.name
                  ? `${sponsor.username} (${sponsor.name})`
                  : sponsor.username
                : 'N/A',
          },
          { data: 'name', defaultContent: 'N/A' },
          { data: 'username', defaultContent: 'N/A' },
          { data: 'email', defaultContent: 'N/A' },
          { data: 'mobile', defaultContent: 'N/A' },
          { data: 'package', defaultContent: '0' },
          { data: 'myRank', defaultContent: '0' },
          {
            data: 'walletAddress',
            render: (address, _, row, meta) => `
              <div class="flex gap-2 items-center">
                ${
                  address
                    ? `${address.slice(0, 15)}...${address.slice(-4)}`
                    : 'N/A'
                }
                <div class="copy-btn" data-address="${address || ''}" data-index="${
                  meta.row
                }">
                  ${
                    copied.index === meta.row && copied.value
                      ? '<span class="text-green-700">Copied</span>'
                      : '<svg class="w-4 h-4" ... >...</svg>' // Replace with your Icon component
                  }
                </div>
              </div>
            `,
          },
          { data: 'createdAt', render: (date) => formatDate(date) },
          {
            data: 'accountStatus.activeStatus',
            render: (status, _, row) => `
              <label class="switch">
                <input type="checkbox" class="status-toggle" data-id="${
                  row._id
                }" data-block-status="${row.accountStatus.blockStatus}" ${
                  status === 1 ? 'checked' : ''
                }>
                <span class="slider round"></span>
              </label>
            `,
          },
          {
            data: 'accountStatus.blockStatus',
            render: (status, _, row) => `
              <label class="switch">
                <input type="checkbox" class="block-toggle" data-id="${
                  row._id
                }" data-active-status="${row.accountStatus.activeStatus}" ${
                  status === 1 ? 'checked' : ''
                }>
                <span class="slider round"></span>
              </label>
            `,
          },
        ],
      });

      // Attach event listeners
      $table
        .off('click', '.edit-btn')
        .on('click', '.edit-btn', function () {
          const id = $(this).data('id');
          navigate(`/users/edituser/${id}`);
        });

      $table
        .off('click', '.login-btn')
        .on('click', '.login-btn', function () {
          const id = $(this).data('id');
          handleRequestImpersonationToken(id);
        });

      $table
        .off('click', '.copy-btn')
        .on('click', '.copy-btn', function () {
          const address = $(this).data('address');
          const index = $(this).data('index');
          if (address) {
            navigator.clipboard.writeText(address);
            setCopied({ index, value: true });
            setTimeout(() => setCopied({ index, value: false }), 1500);
          }
        });

      $table
        .off('change', '.status-toggle')
        .on('change', '.status-toggle', function () {
          const id = $(this).data('id');
          const blockStatus = $(this).data('block-status');
          const currentStatus = $(this).is(':checked') ? 0 : 1;
          handleToggleStatus(id, currentStatus, blockStatus);
        });

      $table
        .off('change', '.block-toggle')
        .on('change', '.block-toggle', function () {
          const id = $(this).data('id');
          const activeStatus = $(this).data('active-status');
          const isBlocked = $(this).is(':checked');
          handleToggleBlock(id, isBlocked, activeStatus);
        });
    };

    // Initialize DataTable with a slight delay to ensure DOM stability
    const timer = setTimeout(initializeDataTable, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (tableInstance && $.fn.dataTable.isDataTable(tableElement)) {
        try {
          tableInstance.clear().destroy();
        } catch (error) {
          console.warn('Error during DataTable cleanup:', error);
        }
      }
    };
  }, [updatedUsers, isLoading, copied, navigate]);



  const handleRequestImpersonationToken = async (userId: string) => {
    try {
      const response = await dispatch(
        requestImpersonationTokenAsync(userId),
      ).unwrap();
      if (response.success) {
        const token = response.data;
        const userAppURL = `${USER_API_URL}?impersonate=${token}`;
        window.open(userAppURL, '_blank');
      } else {
        toast.error('Failed to request user login');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Unexpected error occurred');
    }
  };

  return (
    <>
      <Breadcrumb pageName="All Users" />
      <div className="table-bg">
        <div className="card-body overflow-x-auto">
          <div className="flex justify-end mb-2">
            <div className="w-15">
              <button
                onClick={handleRefresh}
                className="btn-refresh"
                disabled={isLoading}
              >
                <Icon
                  Icon={ICONS.REFRESH}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </button>
            </div>
          </div>
          <table
            ref={tableRef}
            id="dataTable"
            className="table bordered-table display"
          >
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
              ) : null}
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
          
          .btn-refresh:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
    </>
  );
};

export default AllUsers;