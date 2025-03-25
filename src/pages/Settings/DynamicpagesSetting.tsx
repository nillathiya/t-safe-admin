import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Package } from '../../types/package';
import CheckboxOne from '../../components/Checkboxes/CheckboxOne';

const DynamicpagesSetting: React.FC = () => {
  const packageData: Package[] = [
    {
      id: 1,
      name: 'pages Type',
      invoiceDate: `Jan 13,2023`,
      status: 'Paid',
    },
  ];

  return (
    <>
      <Breadcrumb pageName="Dynamicpages Setting" />
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
                      {packageItem.name === 'pages Type' ? (
                        <div className="flex flex-wrap gap-4">
                          {[
                            'Term Condition',
                            'Privacy Policy',
                            'About Us',
                            'Our Mission',
                            'Our Vision',
                            'Legal',
                            'Contact Detail',
                            'Bank Detail',
                            'Social Media Link',
                          ].map((term, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <CheckboxOne />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {term}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
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

export default DynamicpagesSetting;
