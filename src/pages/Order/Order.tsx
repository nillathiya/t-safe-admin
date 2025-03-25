import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import '../../../src/pages/Order/order.css';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
// import 'datatables.net-responsive-dt';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { DEFAULT_PER_PAGE_ITEMS } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import { getAllOrdersAsync } from '../../features/order/orderSlice';
import ExportModal from '../../common/ExportModal';

interface Column {
  label: string;
  key: string;
  format?: (value: any, index?: number) => string;
}

const Order: React.FC = () => {
  const { orders, isLoading } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch<AppDispatch>();
  const tableRef = useRef<HTMLTableElement>(null);
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState<any[]>([]);
  const { companyInfo } = useSelector((state: RootState) => state.settings);

  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
    ?.value;

  useEffect(() => {
    (async () => {
      try {
        if (orders.length === 0) {
          await dispatch(getAllOrdersAsync()).unwrap();
        }
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (tableRef.current && !isLoading && orders.length > 0) {
      const table = $(tableRef.current).DataTable({
        paging: true,
        ordering: true,
        info: true,
        responsive: true,
        searching: true,
        pageLength: DEFAULT_PER_PAGE_ITEMS,
        // select: true as any,
        // destroy: true, // Ensure it gets destroyed before reinitialization
      });

      return () => {
        table.destroy(); // Cleanup DataTable when unmounting
      };
    }
  }, [orders]);

  const groupOrdersByCustomer = (orders: any) => {
    const groupedOrders = orders.reduce((acc: any, order: any) => {
      const username = order.customerId?.username || 'Guest';
      if (!acc[username]) {
        acc[username] = { ...order, amount: order.amount };
      } else {
        acc[username].amount += order.amount;
      }
      return acc;
    }, {});

    return Object.values(groupedOrders);
  };

  const groupedOrders = groupOrdersByCustomer(orders);

  const handleView = (id: string) => {
    if (!id) return;
    navigate(`/order/OrderView?id=${id}`);
  };

  const handlePrintOrder = (orderUsername: string) => {
    if (!orderUsername) {
      toast.error('User not found');
      return;
    }
    const userOrders = orders
      .filter((order) => order.customerId?.username === orderUsername)
      .map((order) => ({
        ...order,
        username: order.customerId?.username || 'N/A',
      }));

    setExportData(userOrders);
    setIsExportModalOpen(true);
  };

  console.log('export data', exportData);
  const exportColumns: Column[] = [
    {
      label: 'S No.',
      key: 'index',
      format: (_, index?: number) =>
        index !== undefined ? (index + 1).toString() : '',
    },
    {
      label: 'User',
      key: 'username',
    },

    {
      label: `Order Amount (${companyCurrency})`,
      key: 'amount',
      format: (value: number) => `${companyCurrency}${value}`,
    },
    {
      label: 'Tx Type',
      key: 'txType',
      format: (value: string) => `${value}`,
    },
    {
      label: 'BV($)',
      key: 'bv',
      format: (value: number) => `${companyCurrency}${value}`,
    },
    {
      label: 'Status',
      key: 'status',
      format: (value: number) => (value === 0 ? 'Pending' : 'Confirmed'),
    },
    {
      label: 'Date',
      key: 'createdAt',
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Breadcrumb pageName="All Orders" />
      <div className="table-bg">
        <div className="card-body overflow-x-auto">
          <table ref={tableRef} className="table bordered-table display">
            <thead>
              <tr>
                <th className="table-header">S No.</th>
                <th className="table-header">Action</th>
                <th className="table-header">USER</th>
                <th className="table-header">
                  Order Amount ({companyCurrency})
                </th>
                <th className="table-header">Payment Status</th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                groupedOrders.map((order: any, index) => (
                  <tr key={index}>
                    <td className="table-cell">{index + 1}</td>
                    <td className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        onClick={() => handleView(order.customerId?._id)}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        onClick={() =>
                          handlePrintOrder(order.customerId?.username)
                        }
                      >
                        Print All
                      </button>
                    </td>

                    <td className="table-cell">
                      {order.customerId?.username
                        ? order.customerId.name
                          ? `${order.customerId.username} (${order.customerId.name})`
                          : order.customerId.username
                        : 'N/A'}
                    </td>
                    <td className="table-cell">
                      {companyCurrency}
                      {order.amount || 'N/A'}
                    </td>
                    <td
                      className={`table-cell ${
                        order.status === 0
                          ? 'text-yellow-500   dark:text-yellow-300'
                          : 'text-green-500  dark:text-green-300'
                      } rounded-md`}
                    >
                      {order.status === 0 ? 'Pending' : 'Confirmed'}
                    </td>

                    <td className="table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={exportData}
        filename="Orders_Report"
        columns={exportColumns}
      />
    </div>
  );
};

export default Order;
