import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Package } from '../../types';
import { useNavigate } from 'react-router-dom';
import './setting.css';
const GeneralSetting: React.FC = () => {
  const packageData: Package[] = [
    {
      id: 1,
      name: 'Registration',
      status: 'Paid',
      invoiceDate: 'Jan 14,2023',
    },
    { id: 2, name: 'Profile', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    {
      id: 3,
      name: 'BTC Account',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    {
      id: 4,
      name: 'Login',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    {
      id: 5,
      name: 'Company',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    { id: 2, name: 'Investment', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    { id: 3, name: 'Withdrawal', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    { id: 4, name: 'Fund', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    { id: 6, name: 'dynamicpages', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    { id: 7, name: 'ReInvestment', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    { id: 8, name: 'Account', invoiceDate: 'Jan 14,2023', status: 'Paid' },
    {
      id: 9,
      name: 'Register with OTP',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    {
      id: 10,
      name: 'BTC Address OTP',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    {
      id: 11,
      name: 'BTC Address With OTP',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },

    {
      id: 13,
      name: 'Payment Method',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    {
      id: 14,
      name: 'Payment Accept Method',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
    {
      id: 15,
      name: 'Rank Settings',
      invoiceDate: 'Jan 14,2023',
      status: 'Paid',
    },
  ];

  const navigate = useNavigate();

  // Single handler function with dynamic logic
  const handleEditClick = (id: number, name: string) => {
    switch (name) {
      case 'Registration':
        navigate(`/setting/general-setting/registration/${id}`);
        break;
      case 'Investment':
        navigate(`/setting/general-setting/investment/${id}`);
        break;
      case 'Withdrawal':
        navigate(`/setting/general-setting/withdrawal/${id}`);
        break;
      case 'Fund':
        navigate(`/setting/general-setting/fund/${id}`);
        break;
      case 'Profile':
        navigate(`/setting/general-setting/profile/${id}`);
        break;
      case 'dynamicpages':
        navigate(`/setting/general-setting/dynamicpages/${id}`);
        break;
      case 'ReInvestment':
        navigate(`/setting/general-setting/reinvestment/${id}`);
        break;
      case 'Account':
        navigate(`/setting/general-setting/account/${id}`);
        break;
      case 'Register with OTP':
        navigate(`/setting/general-setting/registerwithOTP/${id}`);
        break;
      case 'BTC Account':
        navigate(`/setting/general-setting/btcaddressOTP/${id}`);
        break;
      case 'BTC Address With OTP':
        navigate(`/setting/general-setting/btcaddresswithOTP/${id}`);
        break;
      case 'Login':
        navigate(`/setting/general-setting/loginwithOTP/${id}`);
        break;
      case 'Payment Method':
        navigate(`/setting/general-setting/paymentmethod/${id}`);
        break;
      case 'Payment Accept Method':
        navigate(`/setting/general-setting/paymentmethodaccept/${id}`);
        break;
      case 'Company':
        navigate(`/setting/general-setting/companyinfo/${id}`);
        break;
      case 'Rank Settings':
        navigate(`/setting/general-setting/rank-settings/${id}`);
        break;
      default:
        console.warn(`No handler defined for ${name}`);
    }
  };

  return (
    <>
      <Breadcrumb pageName="GeneralSetting" />
      <div className="rounded-sm border mt-6 border-stroke bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[200px] py-2 px-2 font-medium text-black dark:text-white uppercase ">
                  Sr.No
                </th>
                <th className="min-w-[150px]  py-2 px-2 font-medium text-black dark:text-white uppercase ">
                  Setting Name
                </th>
                <th className="min-w-[130px] py-2 px-2 font-medium text-black dark:text-white uppercase ">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {packageData.length ? (
                packageData.map((packageItem) => (
                  <tr key={packageItem.id}>
                    <td className="border-b border-[#eee] py-5 px-2 dark:border-strokedark">
                      <div className="flex items-center">
                        <h5 className="font-medium text-black dark:text-white">
                          {packageItem.id}
                        </h5>
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-2 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                        {packageItem.name}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-2 dark:border-strokedark flex gap-2">
                      <button
                        className="btn-primary"
                        onClick={() =>
                          handleEditClick(packageItem.id, packageItem.name)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GeneralSetting;
