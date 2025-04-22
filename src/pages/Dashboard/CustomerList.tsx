import React, { useEffect, useMemo } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAllUserAsync } from '../../features/user/userSlice';
import toast from 'react-hot-toast';

const NewCustomerList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    (async () => {
      try {
        if (users.length === 0) {
          await dispatch(getAllUserAsync()).unwrap();
        }
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      }
    })();
  }, [dispatch, users.length]);

  // Get latest 5 users
  const latestUsers = useMemo(() => {
    return [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [users]);

  return (
    <div className="card new-customer-card mt-6" style={{ padding: '0px' }}>
      <div
        className="bg-white card-header d-flex align-items-center justify-content-between mb-2 dark:bg-[#24303f]"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '-6px',
          borderBottom: '1px solid lightgray',
        }}
      >
        <h6 className="fw-bold new-customerList">New User List</h6>
        <Link
          to="/users/all-users"
          className="customer-list cursor-pointer p-2"
        >
          View All
        </Link>
      </div>
      <div className="card-body dark:bg-boxdark" style={{ padding: '10px' }}>
        <div
          className="table-responsive dark:border-strokedark dark:bg-boxdark"
          style={{ padding: '10px' }}
        >
          <table className="table table-striped dark:border-strokedark dark:bg-boxdark dark:text-gray-300">
            <thead>
              <tr className="bg-white text-gray-600 dark:bg-[#1a222c] dark:text-gray-300">
                <th className="text-center table-header">Sr no.</th>
                <th className="text-center table-header">Name</th>
                <th className="text-center table-header">Username</th>
                <th className="text-center table-header">Email</th>
                <th className="text-center table-header">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.map((user, index) => (
                <tr key={user._id} className="text-gray-600 dark:text-gray-300">
                  <td className="text-center table-cell">{index + 1}</td>
                  <td>{user.name || 'N/A'}</td>
                  <td className="text-center table-cell">
                    {user.username || 'N/A'}
                  </td>
                  <td className="text-center table-cell">
                    {user.email || 'N/A'}
                  </td>
                  <td className="text-center table-cell">
                    {new Date(user.createdAt).toLocaleDateString() || 'N/A'}
                  </td>
                </tr>
              ))}
              {latestUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerList;
