import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Package } from '../../types/package';
import SwitcherOne from '../../components/Switchers/SwitcherOne';
import CheckboxOne from '../../components/Checkboxes/CheckboxOne';

const WithdrawalSetting: React.FC = () => {
  const packageData: Package[] = [
    {
      id: 1,
      name: 'Minimum Withdrawal Limit 10',
      invoiceDate: `Jan 13,2023`,
      status: 'Paid',
    },
    {
      id: 2,
      name: 'Withdrawal days',
      invoiceDate: `Jan 14,2023`,
      status: 'Paid',
    },
    {
      id: 3,
      name: 'Withdrawal Start-time',
      invoiceDate: `Jan 14,2023`,
      status: 'Paid',
    },
    {
      id: 4,
      name: 'Withdrawal End-time',
      invoiceDate: `Jan 14,2023`,
      status: 'Paid',
    },
    {
      id: 5,
      name: 'Withdrawal with OTP',
      invoiceDate: `Jan 14,2023`,
      status: 'Paid',
    },
    {
      id: 6,
      name: 'Maximum Withdrawal Limit',
      invoiceDate: `Jan 14,2023`,
      status: 'Paid',
    },
    {
      id: 7,
      name: 'Minimum Withdrawal Limit 50',
      invoiceDate: `Jan 14,2023`,
      status: 'Paid',
    },
  ];
  return (
    <>
      <Breadcrumb pageName="Withdrawal Setting" />
      <div className="rounded-sm border mt-6 border-stroke bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[200px] py-2 px-2 font-medium text-black dark:text-white uppercase">
                  Sr.No
                </th>
                <th className="min-w-[150px] py-2 px-2 font-medium text-black dark:text-white uppercase">
                  Setting Name
                </th>
                <th className="min-w-[130px] py-2 px-2 font-medium text-black dark:text-white uppercase">
                  Value
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
                    <td className="border-b border-[#eee] py-5 px-2 dark:border-strokedark">
                      {packageItem.name === 'Withdrawal with OTP' ? (
                        <div>
                          <SwitcherOne />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            On Enable value = "yes", On Disable value = "no"
                          </p>
                        </div>
                      ) : packageItem.name === 'Withdrawal days' ? (
                        <div className="flex">
                          {[
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                          ].map((day, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <CheckboxOne />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {day}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder=""
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      )}
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

export default WithdrawalSetting;
