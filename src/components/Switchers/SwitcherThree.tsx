import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
// import {
//   getCompanyInfoAsync,
//   updateCompanyInfoAsync,
//   selectCompanyInfo,
// } from '../../features/companyInfo/companyInfoSlice';
import { toast } from 'react-hot-toast';
import Loader from '../../common/Loader';

interface ToggleStatusLoadingData {
  id: string | null;
  name: string | null;
}

interface ToggleStatusFormData {
  value: string;
}

const SwitcherThree = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const companyInfo = useSelector(selectCompanyInfo);
  const [toggleData, setToggleData] = useState<any>(null);
  console.log('toggleData', toggleData);
  const [toggleStatusLoadingData, setToggleStatusLoadingData] =
    useState<ToggleStatusLoadingData>({
      id: null,
      name: null,
    });

  useEffect(() => {
    // dispatch(getCompanyInfoAsync({ label: 'editProfileWithOTP' }));
  }, [dispatch]);

  // useEffect(() => {
  //   if (companyInfo && companyInfo.length > 0) {
  //     setToggleData(companyInfo[0]);
  //   }
  // }, [companyInfo]);

  const handleToggleChange = async (
    e: any,
    id: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === '1' ? '0' : '1';
    const changeStatusColumn = e.target.name;
    setToggleStatusLoadingData({
      id,
      name: changeStatusColumn,
    });

    const formData: ToggleStatusFormData = {
      value: newStatus,
    };

    try {
      // await dispatch(updateCompanyInfoAsync({ id, formData }));
      setToggleData((prev: any) => {
        return {
          ...prev,
          value: newStatus,
        };
      });

      toast.success('Status updated successfully.');
    } catch (error: any) {
      toast.error('Failed to update status.');
    } finally {
      setToggleStatusLoadingData({ id: null, name: null });
    }
  };

  return (
    <div>
      <label className="flex cursor-pointer items-center">
        <div className="relative">
          <input
            type="checkbox"
            name="editProfileWithOTP"
            checked={toggleData?.value === '1'}
            onChange={(e) =>
              handleToggleChange(e, toggleData._id, toggleData.value)
            }
            className="sr-only"
          />
          {toggleStatusLoadingData.id === toggleData?._id &&
          toggleStatusLoadingData.name === 'editProfileWithOTP' ? (
            <div className="flex w-10 mx-auto">
              <Loader loader="ClipLoader" size={20} color="blue" />
            </div>
          ) : (
            <>
              <div
                className={`block w-14 h-8 rounded-full ${
                  toggleData?.value === '1' ? 'bg-green-500' : 'bg-gray-500'
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition ${
                  toggleData?.value === '1' ? 'translate-x-full bg-primary' : ''
                }`}
              ></div>
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default SwitcherThree;
