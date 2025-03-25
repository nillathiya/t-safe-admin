import React, { useEffect } from 'react';
import './order.css'; // Import CSS file
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { IoEllipseSharp } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import {
  getAllOrdersAsync,
  getOrderByIdAsync,
} from '../../features/order/orderSlice';
import { Order } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const OrderView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('id');

  const { orders, order } = useSelector((state: RootState) => state.orders);
  const { companyInfo } = useSelector((state: RootState) => state.settings);

  const companyCurrency = companyInfo.find((data) => data.label === 'currency')
    ?.value;

  useEffect(() => {
    if (!userId) return;

    const existingOrder = orders.find(
      (o) => o.customerId && o.customerId._id === userId,
    );
    if (!existingOrder) {
      dispatch(getAllOrdersAsync())
        .unwrap()
        .catch((error: any) => {
          toast.error(error || 'Server error');
        });
    }
  }, [userId, orders, dispatch]);
  const userOrders = Array.isArray(orders)
    ? orders.filter((o) => o?.customerId && o.customerId._id === userId)
    : [];

  console.log('orders', orders);
  console.log('userId', userId);
  return (
    <>
      <Breadcrumb pageName="Order Details" />
      <div className="container">
        <div className="order-layout">
          <div className="order-main">
            <h2 style={{ fontSize: '20px' }}>Order Detail</h2>
            {userOrders.length > 0 ? (
              userOrders.map((order: Order) => (
                <div className="card dark:bg-form-strokedark dark:text-white">
                  <table className="table table-striped">
                    <tbody>
                      <React.Fragment key={order._id}>
                        <tr>
                          <th>User</th>
                          <td>{order.customerId?.username || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Amount</th>
                          <td>
                            {companyCurrency}
                            {order.amount || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <th>Payment Status</th>
                          <td>
                            {order.status === 0 ? 'Pending' : 'Confirmed'}
                          </td>
                        </tr>
                        <tr>
                          <th>Order BV</th>
                          <td>
                            {' '}
                            {companyCurrency}
                            {order.bv || 0}
                          </td>
                        </tr>
                        <tr>
                          <th>Date</th>
                          <td>{formatDate(order.createdAt)}</td>
                        </tr>
                      </React.Fragment>
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>
                  No orders found.
                </td>
              </tr>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderView;
