import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-select-dt';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import {
  changeConatctMesasgeStatusAsync,
  getContactMessagesAsync,
} from '../../features/user/userSlice';
import { DEFAULT_PER_PAGE_ITEMS, ICONS } from '../../constants';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { IContactUs } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import Icon from '../../components/Icons/Icon';

function ContactUs() {
  const dispatch = useDispatch<AppDispatch>();
  const { contactMessages } = useSelector((state: RootState) => state.user);
  const tableRef = useRef<HTMLTableElement>(null);
  const [contactMessageIsLoading, setContactMessageIsLoading] =
    useState<boolean>(false);

  const fetchAllContactMessages = async () => {
    setContactMessageIsLoading(true);
    try {
      await dispatch(getContactMessagesAsync()).unwrap();
    } catch (error: any) {
      toast.error(error || 'Server Error');
    } finally {
      setContactMessageIsLoading(false);
    }
  };
  useEffect(() => {
    if (contactMessages.length === 0) {
    }
    fetchAllContactMessages();
  }, [dispatch]);

  useEffect(() => {
    if (
      tableRef.current &&
      !contactMessageIsLoading &&
      contactMessages.length > 0
    )
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
  }, [contactMessages, contactMessageIsLoading]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // console.log(`Status of ${id} changed to ${newStatus}`);

    const formData = {
      id,
      status: newStatus,
    };
    try {
      await dispatch(changeConatctMesasgeStatusAsync(formData)).unwrap();
      toast.success('Message Updated Successfully');
    } catch (error: any) {
      toast.error(error || 'Server Error');
    }
  };

  const handleRefresh = async () => {
    fetchAllContactMessages();
  };

  return (
    <div>
      <Breadcrumb pageName="Contact-us" />
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
                <th className="table-header">S No.</th>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Mobile</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Message</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {contactMessageIsLoading ? (
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
              ) : contactMessages.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center py-4 text-gray-600 dark:text-gray-300"
                  >
                    No Contact Messages found
                  </td>
                </tr>
              ) : (
                contactMessages.map((message: IContactUs, index) => (
                  <tr key={index}>
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{message.name}</td>
                    <td className="table-cell">{message.email}</td>
                    <td className="table-cell">{message.mobile}</td>
                    <td className="table-cell">{message.subject}</td>
                    <td className="table-cell">{message.message}</td>
                    <td
                      className={`table-cell capitalize ${
                        message.status === 'pending'
                          ? ' !text-yellow-700'
                          : '!text-green-700'
                      }`}
                    >
                      {message.status}
                    </td>
                    <td className="table-cell">
                      <div className="relative">
                        <select
                          value={message.status}
                          onChange={(e) =>
                            handleStatusChange(message._id, e.target.value)
                          }
                          className="px-2 py-1 rounded-md text-sm font-semibold cursor-pointer 
                 border shadow-md focus:outline-none focus:ring-2 
                 dark:bg-gray-800 dark:text-white dark:border-gray-600
                 bg-white text-gray-700 border-gray-300"
                        >
                          <option value="pending" className="text-yellow-600">
                            Pending
                          </option>
                          <option value="resolved" className="text-green-600">
                            Resolved
                          </option>
                        </select>
                      </div>
                    </td>

                    <td>{formatDate(message.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
