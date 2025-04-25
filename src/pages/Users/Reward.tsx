import { useState } from 'react';
import React from 'react';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import Loader from '../../common/Loader';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SearchInput from '../../common/Search/SearchInput';
import Pagination from '../../common/Pagination/Pagination';

interface ToggleStatusLoadingData {
  id: string | null;
  name: string | null;
}

const Reward: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);

  // filter table data
  const [searchTerm, setSearchTerm] = useState('');

  // filter data
  const filteredData = members.filter(
    (item) =>
      item.Userid.includes(searchTerm) ||
      item.fCode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.amount.includes(searchTerm) ||
      item.status.includes(searchTerm) ||
      item.replay.includes(searchTerm) ||
      item.walletType.includes(searchTerm),
  );

  // pagoination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  return (
    <>
      <Breadcrumb pageName="Reward" />
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="rounded-sm border mt-6 border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white uppercase ">
                  S.No
                </th>
                <th className=" min-w-[150px] py-4 px-4 font-medium text-black dark:text-white uppercase ">
                  USERID(NAME)
                </th>
                <th className=" min-w-[150px]py-4 px-4 font-medium text-black dark:text-white uppercase ">
                  Rank
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white uppercase ">
                  Complete Date
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((user: any, index: number) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                        {members}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                        {members}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                        {members}
                      </h5>
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

export default Reward;
