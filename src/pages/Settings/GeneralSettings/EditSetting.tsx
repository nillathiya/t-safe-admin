import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../store/store';
import {
  getAdminSettingsAsync,
  getUserSettingsAsync,
  updateUserSettingAsync,
  updateAdminSettingAsync,
} from '../../../features/settings/settingsSlice';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Loader from '../../../common/Loader';
import { API_URL } from '../../../constants';
import './setting.css';
import Select from 'react-select';

interface Option {
  key: string;
  label: string;
  status: boolean;
}

interface SettingItem {
  _id: string;
  name: string;
  title: string;
  value: string | string[] | Option[] | boolean;
  type:
    | 'text'
    | 'image'
    | 'date'
    | 'multi_values'
    | 'option'
    | 'array'
    | 'json_array'
    | 'boolean';
  options?: string[] | string | Option[] | boolean;
}

const EditSetting: React.FC = () => {
  const { category, title } = useParams<{ category: string; title: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { userSettings, adminSettings } = useSelector(
    (state: RootState) => state.settings,
  );
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [editableSettings, setEditableSettings] = useState<SettingItem[]>([]);
  const [formData, setFormData] = useState<
    Record<string, string | string[] | Option[] | File | boolean>
  >({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const fetchSettings = useCallback(async () => {
    if (!category) return;

    setIsLoading(true);
    try {
      switch (category) {
        case 'rank-settings':
          navigate('/setting/general-setting/rank-settings');
          break;
        case 'user-settings':
          await dispatch(getUserSettingsAsync()).unwrap();
          setSettings(userSettings);
          break;
        case 'admin-settings':
          if (adminSettings.length === 0) {
            await dispatch(getAdminSettingsAsync()).unwrap();
          }
          setSettings(adminSettings);
          break;
        case 'companyInfo-settings':
          navigate('/setting/general-setting/companyinfo');
          break;
        default:
          toast.error('Invalid category');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Server Error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    console.log('settings', settings);
    if (settings.length > 0 && title) {
      const matchedSettings = settings.filter(
        (setting) => setting.title.trim() === title.trim(),
      );
      setEditableSettings(matchedSettings);
      const newFormData: Record<
        string,
        string | string[] | Option[] | File | boolean
      > = {};
      const newFilePreviews: Record<string, string> = {};
      matchedSettings.forEach((setting) => {
        if (setting.type === 'array' && Array.isArray(setting.value)) {
          // Convert initial value (array of objects) to array of keys
          newFormData[setting._id] = (setting.value as Option[]).map(
            (opt) => opt.key,
          );
        } else {
          newFormData[setting._id] = setting.value;
        }
        if (setting.type === 'image' && setting.value) {
          newFilePreviews[setting._id] = (setting.value as string).startsWith(
            '/uploads',
          )
            ? `${API_URL}${setting.value}`
            : (setting.value as string);
        }
      });
      setFormData(newFormData);
      setFilePreviews(newFilePreviews);
    }
  }, [settings, title]);

  const handleInputChange = useCallback(
    (id: string, value: string | string[] | File) => {
      setFormData((prev) => ({ ...prev, [id]: value }));
    },
    [],
  );

  const handleSelectChange = useCallback((id: string, selectedOptions: any) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option: { value: string }) => option.value)
      : [];
    setFormData((prev) => ({ ...prev, [id]: selectedValues }));
  }, []);

  const handleFileChange = useCallback(
    (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload a valid image file.');
          return;
        }
        setFormData((prev) => ({ ...prev, [id]: file }));
        setFilePreviews((prev) => ({
          ...prev,
          [id]: URL.createObjectURL(file),
        }));
      }
    },
    [],
  );

  const handleToggleChange = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleSubmit = useCallback(
    async (setting: SettingItem) => {
      if (!category) return;

      setIsUpdating((prev) => ({ ...prev, [setting._id]: true }));
      let value;
      value = formData[setting._id];
      console.log('setting', setting);
      console.log('selected value', value);

      if (
        Array.isArray(value) &&
        value.every((v) => typeof v === 'string') &&
        Array.isArray(setting.value)
      ) {
        const selectedKeys = value as string[];
        value = (setting.options as Option[]).filter((item) =>
          selectedKeys.includes(item.key),
        );
      }

      console.log('value', value);
      try {
        let result;

        if (setting.type === 'image') {
          // Handle FormData only for image
          const formDataToSend = new FormData();
          formDataToSend.append('file', value as File);

          switch (category) {
            case 'user-settings':
              result = await dispatch(
                updateUserSettingAsync({
                  id: setting._id,
                  formData: formDataToSend,
                }),
              ).unwrap();
              break;
            case 'admin-settings':
              result = await dispatch(
                updateAdminSettingAsync({
                  id: setting._id,
                  formData: formDataToSend,
                }),
              ).unwrap();
              break;
            default:
              throw new Error('Unsupported category for update');
          }
        } else {
          const payload = {
            id: setting._id,
            formData: {
              value: typeof value === 'string' ? value : value,
            },
          };

          switch (category) {
            case 'user-settings':
              result = await dispatch(updateUserSettingAsync(payload)).unwrap();
              break;
            case 'admin-settings':
              result = await dispatch(
                updateAdminSettingAsync(payload),
              ).unwrap();
              break;
            default:
              throw new Error('Unsupported category for update');
          }
        }

        if (result?.status === 'success' && result?.data) {
          setFormData((prev) => ({
            ...prev,
            [setting._id]: result.data.value,
          }));

          if (setting.type === 'image') {
            setFilePreviews((prev) => ({
              ...prev,
              [setting._id]: `${API_URL}${result.data.value}`,
            }));
          }

          toast.success(`${setting.name} updated successfully`);
        }
      } catch (error: any) {
        toast.error(error?.message || `Failed to update ${setting.name}`);
      } finally {
        setIsUpdating((prev) => ({ ...prev, [setting._id]: false }));
      }
    },
    [dispatch, formData, category],
  );

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [filePreviews]);

  if (!category || !title) {
    return <div className="p-6">Invalid category or title</div>;
  }

  console.log('formData', formData);
  return (
    <>
      <Breadcrumb pageName={`Edit ${title} (${category})`} />
      <div className="rounded-sm border mt-6 border-stroke bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {isLoading ? (
          <Loader loader="ClipLoader" size={50} color="blue" />
        ) : editableSettings.length > 0 ? (
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-2 px-2 font-medium text-black dark:text-white uppercase">
                    Sr.No
                  </th>
                  <th className="py-2 px-2 font-medium text-black dark:text-white uppercase">
                    Setting Name
                  </th>
                  <th className="py-2 px-2 font-medium text-black dark:text-white uppercase">
                    Value
                  </th>
                  <th className="py-2 px-2 font-medium text-black dark:text-white uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {editableSettings.map((setting, index) => (
                  <tr
                    key={setting._id}
                    className="border-b dark:border-strokedark"
                  >
                    <td className="py-5 px-2">{index + 1}</td>
                    <td className="py-5 px-2">{setting.name}</td>
                    <td className="py-5 px-2">
                      {setting.type.trim() === 'text' && (
                        <input
                          type="text"
                          value={(formData[setting._id] as string) || ''}
                          onChange={(e) =>
                            handleInputChange(setting._id, e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                        />
                      )}
                      {setting.type === 'image' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(setting._id, e)}
                          />
                          {filePreviews[setting._id] && (
                            <img
                              src={filePreviews[setting._id]}
                              alt={`${setting.name} Preview`}
                              className="w-32 h-32 object-cover border rounded"
                            />
                          )}
                        </div>
                      )}
                      {setting.type === 'date' && (
                        <input
                          type="date"
                          value={(formData[setting._id] as string) || ''}
                          onChange={(e) =>
                            handleInputChange(setting._id, e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                        />
                      )}
                      {/* {setting.type.trim() === 'multi_values' &&
                        (() => {
                          let optionsArray: string[] = [];

                          if (setting.options) {
                            try {
                              if (typeof setting.options === 'string') {
                                if (
                                  setting.options.startsWith('[') &&
                                  setting.options.endsWith(']')
                                ) {
                                  optionsArray = JSON.parse(setting.options);
                                } else {
                                  optionsArray = setting.options
                                    .split(',')
                                    .map((v) =>
                                      v.replace(/['"\[\]]/g, '').trim(),
                                    );
                                }
                              } else if (Array.isArray(setting.options)) {
                                optionsArray = setting.options;
                              }
                            } catch (error) {
                              console.error(
                                'Error parsing setting.options:',
                                error,
                              );
                            }
                          }

                          const handleCheckboxChange = (
                            settingId: string,
                            value: string,
                          ) => {
                            setFormData((prevData) => {
                              const currentValues = Array.isArray(
                                prevData[settingId],
                              )
                                ? [...(prevData[settingId] as string[])]
                                : [];

                              if (currentValues.includes(value)) {
                                const updatedValues = currentValues.filter(
                                  (v) => v !== value,
                                );
                                return {
                                  ...prevData,
                                  [settingId]: updatedValues,
                                };
                              } else {
                                const updatedValues = [...currentValues, value];
                                return {
                                  ...prevData,
                                  [settingId]: updatedValues,
                                };
                              }
                            });
                          };

                          return (
                            <div className="check_box_scroll flex flex-col space-y-2">
                              {optionsArray.map((opt) => (
                                <label
                                  key={opt}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      Array.isArray(formData[setting._id]) &&
                                      formData[setting._id].includes(opt)
                                    }
                                    onChange={() =>
                                      handleCheckboxChange(setting._id, opt)
                                    }
                                    className="border border-gray-300 h-4 w-4 text-primary rounded focus:ring-primary"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          );
                        })()} */}
                      {/* {setting.type.trim() === 'json_array' &&
                        (() => {
                          let parsedOptions: Record<string, string> = {};

                          try {
                            let firstParse = JSON.parse(setting.options);
                            parsedOptions =
                              typeof firstParse === 'string'
                                ? JSON.parse(firstParse)
                                : firstParse;
                          } catch (error) {
                            console.error(
                              '❌ Error parsing setting.options:',
                              error,
                            );
                          }

                          if (
                            !parsedOptions ||
                            typeof parsedOptions !== 'object'
                          ) {
                            return <p>Error: Options are not valid</p>;
                          }

                          const optionsArray = Object.entries(
                            parsedOptions,
                          ).map(([key, label]) => {
                            return { key, label };
                          });

                          return (
                            <div className="flex flex-col space-y-2">
                              <select
                                value={
                                  typeof formData[setting._id] === 'string'
                                    ? formData[setting._id]
                                    : ''
                                }
                                onChange={(e) =>
                                  setFormData((prevData) => ({
                                    ...prevData,
                                    [setting._id]: e.target.value,
                                  }))
                                }
                                className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                              >
                                <option value="">Select an option</option>
                                {optionsArray.length > 0 ? (
                                  optionsArray.map((opt) => (
                                    <option key={opt.key} value={opt.key}>
                                      {String(opt.label)}
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>No options available</option>
                                )}
                              </select>
                            </div>
                          );
                        })()} */}
                      {/* {setting.type === 'option' &&
                        (() => {
                          const options: string[] = Array.isArray(
                            setting.options,
                          )
                            ? setting.options
                            : typeof setting.options === 'string'
                            ? setting.options
                                .split(',')
                                .map((opt) => opt.trim())
                            : ['Yes', 'No'];

                          const filteredOptions = options.filter(
                            (opt) => opt.length > 0,
                          );
                          if (filteredOptions.length === 0) return null;

                          return (
                            <select
                              value={(formData[setting._id] as string) || ''}
                              onChange={(e) =>
                                handleInputChange(setting._id, e.target.value)
                              }
                              className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                            >
                              <option value="">Select an option</option>
                              {filteredOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          );
                        })()} */}

                      {setting.type === 'boolean' && (
                        <div>
                          <label className="flex cursor-pointer items-center">
                            <div className="relative">
                              <input
                                type="checkbox"
                                name="editProfileWithOTP"
                                checked={formData[setting._id] === true}
                                onChange={(e) =>
                                  handleToggleChange(setting._id)
                                }
                                className="sr-only"
                              />
                              {false ? (
                                <div className="flex w-10 mx-auto">
                                  <Loader
                                    loader="ClipLoader"
                                    size={20}
                                    color="blue"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div
                                    className={`block w-14 h-8 rounded-full ${
                                      formData[setting._id] === true
                                        ? 'bg-green-500'
                                        : 'bg-gray-500'
                                    }`}
                                  ></div>
                                  <div
                                    className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition ${
                                      formData[setting._id] === true
                                        ? 'translate-x-full bg-primary'
                                        : ''
                                    }`}
                                  ></div>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                      )}
                      {setting.type === 'array' && (
                        <div>
                          <Select
                            isMulti
                            options={
                              Array.isArray(setting.options)
                                ? setting.options.map((opt) => {
                                    if (
                                      typeof opt === 'object' &&
                                      'key' in opt &&
                                      'label' in opt
                                    ) {
                                      return {
                                        value: opt.key,
                                        label: opt.label,
                                      };
                                    }
                                    return {
                                      value: String(opt),
                                      label: String(opt),
                                    };
                                  })
                                : []
                            }
                            value={
                              Array.isArray(formData[setting._id])
                                ? (formData[setting._id] as string[])
                                    .map((key) => {
                                      const opt = Array.isArray(setting.options)
                                        ? setting.options.find(
                                            (o) =>
                                              (typeof o === 'object' &&
                                                o.key === key) ||
                                              o === key,
                                          )
                                        : null;
                                      return opt
                                        ? {
                                            value:
                                              typeof opt === 'object'
                                                ? opt.key
                                                : opt,
                                            label:
                                              typeof opt === 'object'
                                                ? opt.label
                                                : opt,
                                          }
                                        : null;
                                    })
                                    .filter(
                                      (
                                        item,
                                      ): item is {
                                        value: string;
                                        label: string;
                                      } => Boolean(item),
                                    )
                                : []
                            }
                            onChange={(selected) =>
                              handleSelectChange(setting._id, selected)
                            }
                            placeholder="Select options..."
                            styles={{
                              container: (base) => ({
                                ...base,
                                width: 300,
                              }),
                            }}
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                          />
                          <p>
                            Selected Values:{' '}
                            {Array.isArray(formData[setting._id]) &&
                            (formData[setting._id] as string[]).length > 0
                              ? (formData[setting._id] as string[])
                                  .map((key) => {
                                    const opt = Array.isArray(setting.options)
                                      ? setting.options.find(
                                          (o) =>
                                            (typeof o === 'object' &&
                                              o.key === key) ||
                                            o === key,
                                        )
                                      : null;
                                    return opt
                                      ? typeof opt === 'object'
                                        ? opt.label
                                        : opt
                                      : null;
                                  })
                                  .filter(Boolean)
                                  .join(', ') || 'None'
                              : 'None'}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-2">
                      <button
                        onClick={() => handleSubmit(setting)}
                        className="bg-primary text-white p-2 rounded w-full disabled:opacity-50 transition-opacity"
                        disabled={isUpdating[setting._id] || false}
                      >
                        {isUpdating[setting._id] ? (
                          <Loader loader="ClipLoader" size={20} color="white" />
                        ) : (
                          'Update'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-5 text-center text-black dark:text-white">
            No settings found for "{title}" in "{category}"
          </div>
        )}
      </div>
    </>
  );
};

export default EditSetting;
