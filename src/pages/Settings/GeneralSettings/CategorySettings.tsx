import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../store/store';
import {
  getAdminSettingsAsync,
  
  getUserSettingsAsync,
} from '../../../features/settings/settingsSlice';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';

interface SettingItem {
  title: string;
}

const formatCategoryName = (category: string): string =>
  category
    .replace('-', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();

const CategorySettings: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userSettings, adminSettings } = useSelector(
    (state: RootState) => state.settings
  );

  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingItem[]>([]);

  const fetchSettings = useCallback(async () => {
    if (!category) return;
  
    setIsLoading(true);
    try {
      let fetchedSettings: SettingItem[] = [];
      switch (category) {
        case 'user-settings':
          if (userSettings.length === 0) {
            const response = await dispatch(getUserSettingsAsync()).unwrap();
            fetchedSettings = response.data || [];
          } else {
            fetchedSettings = userSettings;
          }
          break;
        case 'admin-settings':
          if (adminSettings.length === 0) {
            const response = await dispatch(getAdminSettingsAsync()).unwrap();
            fetchedSettings = response.data || [];
          } else {
            fetchedSettings = adminSettings;
          }
          break;
        case 'rank-settings':
          navigate('/setting/general-setting/rank-settings');
          return;
        case 'companyInfo-settings':
          navigate('/setting/general-setting/companyinfo');
          return;
        default:
          toast.error('Invalid category');
          return;
      }
      setSettings(fetchedSettings);
    } catch (error: any) {
      toast.error(error?.message || 'Server Error');
    } finally {
      setIsLoading(false);
    }
  }, [category, dispatch, navigate, userSettings, adminSettings]);
  

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (category === 'user-settings' && userSettings.length > 0) {
      setSettings(userSettings);
    } else if (category === 'admin-settings' && adminSettings.length > 0) {
      setSettings(adminSettings);
    }
  }, [userSettings, adminSettings, category]);

  const settingTitles = React.useMemo(
    () =>
      Array.from(new Set(settings.map((item) => item.title).filter(Boolean))),
    [settings]
  );

  const handleEditClick = useCallback(
    (title: string) => {
      navigate(`/setting/general-setting/${category}/${title}`);
    },
    [navigate, category]
  );

  if (!category) {
    return <div className="p-6">Invalid category</div>;
  }

  return (
    <>
      <Breadcrumb pageName={formatCategoryName(category)} />
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-5 text-center">
                    Loading settings...
                  </td>
                </tr>
              ) : settingTitles.length > 0 ? (
                settingTitles.map((title, index) => (
                  <tr
                    key={title}
                    className="border-b border-[#eee] dark:border-strokedark"
                  >
                    <td className="py-5 px-2">
                      <h5 className="font-medium text-black dark:text-white">
                        {index + 1}
                      </h5>
                    </td>
                    <td className="py-5 px-2">
                      <h5 className="font-medium text-black dark:text-white">
                        {formatCategoryName(title)}
                      </h5>
                    </td>
                    <td className="py-5 px-2 flex gap-2">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
                        onClick={() => handleEditClick(title)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-5 text-center">
                    No settings available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CategorySettings;
