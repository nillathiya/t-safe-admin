import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import {
  deleteCompanyInfoAsync,
  getAllComapnyInfoForAdminAsync,
  updateCompanyInfoAsync,
} from '../../../features/settings/settingsSlice';
import { toast } from 'react-hot-toast';
import Loader from '../../../common/Loader';
import { ICONS } from '../../../constants';
import Icon from '../../../components/Icons/Icon';
import { API_URL } from '../../../api/routes';
import { ICompanyInfo } from '../../../types';

enum ActionType {
  UPDATE = 'update',
  DELETE = 'delete',
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CompanyInfoSetting: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminCompanyInfo, companyInfoLoading } = useSelector(
    (state: RootState) => state.settings,
  ) as { adminCompanyInfo: ICompanyInfo[] | null; companyInfoLoading: boolean };

  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string | File>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [submittingFields, setSubmittingFields] = useState<
    Record<string, { value: boolean; action: ActionType }>
  >({});

  // Fetch company info on mount
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        await dispatch(getAllComapnyInfoForAdminAsync()).unwrap();
      } catch (error: any) {
        toast.error(error || 'Server Error');
      }
    };
    fetchCompanyInfo();
  }, [dispatch]);

  // Update form data and file previews when companyInfo changes
  useEffect(() => {
    if (adminCompanyInfo) {
      const newFormData: Record<string, string | File> = {};
      const newFilePreviews: Record<string, string> = {};
      adminCompanyInfo.forEach((item: ICompanyInfo) => {
        newFormData[item._id] = item.value || '';
        if (item.type === 'image' || item.type === 'file') {
          newFilePreviews[item._id] = item.value || '';
        }
      });
      setFormData(newFormData);
      setFilePreviews(newFilePreviews);
    }
  }, [adminCompanyInfo]);

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => {
        if (!url.startsWith('/uploads')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [filePreviews]);

  // Get unique titles
  const uniqueTitles = Array.from(
    new Set(adminCompanyInfo?.map((item) => item.title).filter(Boolean)),
  );

  const handleInputChange = (id: string, value: string | File) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const setting = adminCompanyInfo?.find((item) => item._id === id);

      if (setting?.type === 'image' && !file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file.');
        return;
      }
      if (
        setting?.type === 'file' &&
        !['image/', 'application/pdf'].some((type) =>
          file.type.startsWith(type),
        )
      ) {
        toast.error('Please upload an image or PDF file.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }

      if (filePreviews[id] && !filePreviews[id].startsWith('/uploads')) {
        URL.revokeObjectURL(filePreviews[id]);
      }
      setFormData((prev) => ({ ...prev, [id]: file }));
      setFilePreviews((prev) => ({
        ...prev,
        [id]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (id: string, setting: ICompanyInfo) => {
    const value = formData[id];
    const settingItem = adminCompanyInfo?.find((item) => item._id === id);
    const settingId = settingItem?._id;

    if (!settingId) {
      toast.error(`No matching setting found`);
      return;
    }

    const formDataToSend = new FormData();
    if (setting.type === 'image' || setting.type === 'file') {
      formDataToSend.append('file', value as File);
    } else {
      formDataToSend.append('value', value as string);
    }
    setSubmittingFields((prev) => ({
      ...prev,
      [id]: { value: true, action: ActionType.UPDATE },
    }));

    try {
      await dispatch(
        updateCompanyInfoAsync({ id: settingId, formData: formDataToSend }),
      ).unwrap();
      toast.success('Updated successfully.');
    } catch (error: any) {
      toast.error(error || 'Failed to update.');
    } finally {
      setSubmittingFields((prev) => ({
        ...prev,
        [id]: { value: false, action: ActionType.UPDATE },
      }));
    }
  };

  const handleDelete = async (id: string, setting: ICompanyInfo) => {
    const settingItem = adminCompanyInfo?.find((item) => item._id === id);
    const settingId = settingItem?._id;

    if (!settingId) {
      toast.error(`No matching setting`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${setting.name}?`)) {
      return;
    }
    setSubmittingFields((prev) => ({
      ...prev,
      [id]: { value: true, action: ActionType.DELETE },
    }));

    try {
      await dispatch(deleteCompanyInfoAsync(settingId)).unwrap();
      setFormData((prev) => {
        const newFormData = { ...prev };
        delete newFormData[id];
        return newFormData;
      });
      setFilePreviews((prev) => {
        const newPreviews = { ...prev };
        if (newPreviews[id] && !newPreviews[id].startsWith('/uploads')) {
          URL.revokeObjectURL(newPreviews[id]);
        }
        delete newPreviews[id];
        return newPreviews;
      });
      toast.success(`${setting.name} deleted successfully.`);
    } catch (error) {
      toast.error(`Failed to delete ${setting.name}.`);
    } finally {
      setSubmittingFields((prev) => ({
        ...prev,
        [id]: { value: false, action: ActionType.DELETE },
      }));
    }
  };

  const handleRefresh = async () => {
    try {
      await dispatch(getAllComapnyInfoForAdminAsync()).unwrap();
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
  };

  if (!adminCompanyInfo) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <Breadcrumb pageName="Company Info Settings" />
        <div className="max-w-7xl mx-auto mt-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            No company info available
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Company Info Settings" />
      <div className="min-h-screen bg-gray-100 p-6 rounded-sm border mt-6 border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-7xl mx-auto mt-6">
          {companyInfoLoading ? (
            <div className="flex justify-center">
              <Loader loader="ClipLoader" size={50} color="blue" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title Tiles */}
              <div className="flex justify-end">
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition w-10 h-10 flex items-center justify-center"
                  title="Refresh"
                  aria-label="Refresh company info"
                >
                  <Icon Icon={ICONS.REFRESH} className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueTitles.map((title) => (
                  <div
                    key={title}
                    onClick={() => setSelectedTitle(title)}
                    className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 text-center ${
                      selectedTitle === title
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <h3 className="text-lg font-medium">{title}</h3>
                  </div>
                ))}
                {uniqueTitles.length === 0 && (
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                    No categories available
                  </p>
                )}
              </div>

              {/* Settings Form */}
              {selectedTitle && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    {selectedTitle} Settings
                  </h3>
                  <div className="space-y-4">
                    {adminCompanyInfo
                      .filter(
                        (item: ICompanyInfo) => item.title === selectedTitle,
                      )
                      .map((item: ICompanyInfo) => (
                        <div
                          key={item._id}
                          className="flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                          <label className="w-full sm:w-1/4 text-gray-700 dark:text-gray-300 font-medium">
                            {item.name}
                          </label>
                          <div className="w-full sm:w-3/4 flex flex-col sm:flex-row gap-4 items-center">
                            {/* Input */}
                            {(item.type === 'image' ||
                              item.type === 'file') && (
                              <div className="flex flex-col gap-2 w-full max-w-xs">
                                <label
                                  htmlFor={`file-input-${item._id}`}
                                  className="block w-full bg-blue-50 text-blue-700 text-sm font-semibold py-2 px-4 rounded-md text-center cursor-pointer hover:bg-blue-100 transition"
                                >
                                  Choose{' '}
                                  {item.type === 'image' ? 'Image' : 'File'}
                                  <input
                                    id={`file-input-${item._id}`}
                                    type="file"
                                    accept={
                                      item.type === 'image'
                                        ? 'image/*'
                                        : 'image/*,application/pdf'
                                    }
                                    onChange={(e) =>
                                      handleFileChange(item._id, e)
                                    }
                                    className="hidden"
                                  />
                                </label>
                                {filePreviews[item._id] ? (
                                  <img
                                    src={
                                      filePreviews[item._id].startsWith(
                                        '/uploads',
                                      )
                                        ? `${API_URL}${filePreviews[item._id]}`
                                        : filePreviews[item._id]
                                    }
                                    alt={`${item.name} Preview`}
                                    className="w-full h-full rounded border object-center"
                                  />
                                ) : (
                                  <div className="w-24 h-24 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-xs">
                                    No Preview
                                  </div>
                                )}
                              </div>
                            )}
                            {item.type === 'number' && (
                              <input
                                type="number"
                                value={(formData[item._id] as string) || ''}
                                onChange={(e) =>
                                  handleInputChange(item._id, e.target.value)
                                }
                                className="w-full max-w-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                              />
                            )}
                            {item.type === 'string' && (
                              <input
                                type="text"
                                value={(formData[item._id] as string) || ''}
                                onChange={(e) =>
                                  handleInputChange(item._id, e.target.value)
                                }
                                className="w-full max-w-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                              />
                            )}

                            {/* Action */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmit(item._id, item)}
                                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 h-10 flex items-center justify-center min-w-[80px]"
                                disabled={
                                  submittingFields[item._id]?.value &&
                                  submittingFields[item._id]?.action ===
                                    ActionType.UPDATE
                                }
                              >
                                {submittingFields[item._id]?.value &&
                                submittingFields[item._id]?.action ===
                                  ActionType.UPDATE ? (
                                  <Loader
                                    loader="ClipLoader"
                                    size={20}
                                    color="white"
                                  />
                                ) : (
                                  'Update'
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(item._id, item)}
                                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50 h-10 flex items-center justify-center min-w-[80px]"
                                disabled={
                                  submittingFields[item._id]?.value &&
                                  submittingFields[item._id]?.action ===
                                    ActionType.DELETE
                                }
                              >
                                {submittingFields[item._id]?.value &&
                                submittingFields[item._id]?.action ===
                                  ActionType.DELETE ? (
                                  <Loader
                                    loader="ClipLoader"
                                    size={20}
                                    color="white"
                                  />
                                ) : (
                                  'Delete'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyInfoSetting;
