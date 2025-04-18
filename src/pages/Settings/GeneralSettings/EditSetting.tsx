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
import './setting.css';
import Select from 'react-select';
import { API_URL } from '../../../api/routes';

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
    | 'boolean'
    | 'single-element-array'
    | 'number';
  options?: string[] | string | Option[] | boolean;
}

function checkOptionsType(options: any): 'string[]' | 'Option[]' | 'unknown' {
  // Handle undefined or non-array cases
  if (!options || !Array.isArray(options)) {
    return 'unknown';
  }

  // If array is empty, type cannot be determined reliably
  if (options.length === 0) {
    return 'unknown';
  }

  // Check the type of the first element
  const firstElement = options[0];

  if (typeof firstElement === 'string') {
    // Verify all elements are strings
    const allStrings = options.every((item: any) => typeof item === 'string');
    return allStrings ? 'string[]' : 'unknown';
  } else if (
    typeof firstElement === 'object' &&
    firstElement !== null &&
    'key' in firstElement
  ) {
    // Verify all elements are objects with a 'key' property
    const allOptions = options.every(
      (item: any) => typeof item === 'object' && item !== null && 'key' in item,
    );
    return allOptions ? 'Option[]' : 'unknown';
  }

  return 'unknown';
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
        case 'user-settings': {
          const result = await dispatch(getUserSettingsAsync()).unwrap();
          setSettings(result.data); // Use API response directly
          break;
        }
        case 'admin-settings': {
          if (adminSettings.length === 0) {
            const result = await dispatch(getAdminSettingsAsync()).unwrap();
            setSettings(result.data); // Use API response directly
          } else {
            setSettings(adminSettings); // Use existing adminSettings
          }
          break;
        }
        case 'companyInfo-settings':
          navigate('/setting/general-setting/companyInfo-settings');
          break;
        default:
          toast.error('Invalid category');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Server Error');
    } finally {
      setIsLoading(false);
    }
  }, [category, dispatch, adminSettings, navigate]); // Removed userSettings

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    console.log('settings', settings);
    // Only process settings if they exist and title is provided
    if (settings.length > 0 && title) {
      const matchedSettings = settings.filter(
        (setting) => setting.title.trim() === title.trim(),
      );

      if (matchedSettings.length === 0) {
        console.warn('No settings found for title:', title);
        toast.error('No settings found for the specified title');
        return;
      }

      setEditableSettings(matchedSettings);

      const newFormData: Record<
        string,
        string | string[] | Option[] | File | boolean
      > = {};
      const newFilePreviews: Record<string, string> = {};

      matchedSettings.forEach((setting) => {
        if (setting.type === 'array' && Array.isArray(setting.value)) {
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
    (id: string, value: string | string[] | File, setting: SettingItem) => {
      setFormData((prev) => {
        let newValue: any = value;

        switch (setting.type) {
          case 'number':
            newValue = parseFloat(value as string);
            break;
          // case 'file':
          //   newValue = value as File;
          //   break;
          // case 'multi-select':
          //   newValue = value as string[];
          //   break;
          default:
            newValue = value;
        }

        return { ...prev, [id]: newValue };
      });
    },
    [],
  );

  const handleSelectChange = useCallback(
    (id: string, selectedOptions: any, setting: any) => {
      // const selectedValues = selectedOptions
      //   ? selectedOptions.map((option: { value: string }) => option.value)
      //   : [];

      let selectedValues: string[] | string;

      if (setting.type === 'array') {
        // Multi-select: store array of values
        selectedValues = selectedOptions
          ? selectedOptions.map((option: { value: string }) => option.value)
          : [];
      } else if (setting.type === 'single-element-array') {
        // Single-select: store single value or undefined
        selectedValues =
          selectedOptions && !Array.isArray(selectedOptions)
            ? selectedOptions.value
            : '';
      }
      setFormData((prev) => ({ ...prev, [id]: selectedValues }));
    },
    [],
  );

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

      // handle value if value is in array ["fund_wallet"];
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

      // handle value if value is in single "fund_wallet"
      if (!Array.isArray(value) && typeof value === 'string') {
        const selectedKeys = value;

        // Check if setting.options is defined and an array
        if (setting.options && Array.isArray(setting.options)) {
          const optionsType = checkOptionsType(setting.options);

          if (optionsType === 'Option[]') {
            // Handle Option[] array
            value = (setting.options as Option[]).filter((item: Option) =>
              selectedKeys.includes(item.key),
            );
          } else if (optionsType === 'string[]') {
            // Handle string[] array
            value = (setting.options as string[]).filter((item: string) =>
              selectedKeys.includes(item),
            );
          }
          // If 'unknown', you can decide to skip or handle differently
        }
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

  // console.log('formData', formData);
  console.log('editableSettings', editableSettings);
  return (
    <>
      <Breadcrumb pageName={`Edit ${title} (${category})`} />
      <div className="rounded-sm border mt-6 border-stroke bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {isLoading ? (
          <Loader loader="ClipLoader" size={50} color="blue" />
        ) : editableSettings.length > 0 ? (
          <div className="max-w-full overflow-auto custom-scrollbar">
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
                      {(setting.type.trim() === 'text' ||
                        setting.type === 'number' ||
                        setting.type.trim() === 'string') && (
                        <input
                          type="text"
                          value={(formData[setting._id] as string) || ''}
                          onChange={(e) =>
                            handleInputChange(
                              setting._id,
                              e.target.value,
                              setting,
                            )
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
                            handleInputChange(
                              setting._id,
                              e.target.value,
                              setting,
                            )
                          }
                          className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                        />
                      )}

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
                        <div className="flex flex-col gap-2">
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
                              handleSelectChange(setting._id, selected, setting)
                            }
                            placeholder="Select options..."
                            className="w-full"
                            classNamePrefix="react-select"
                            styles={{
                              control: (base) => ({
                                ...base,
                                backgroundColor: 'transparent',
                                borderColor: '#e5e7eb', // Light mode: gray-200
                                borderRadius: '0.375rem', // Matches rounded-md
                                padding: '0.5rem 1rem', // Matches py-2 px-4
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#3b82f6', // Matches focus:border-primary (blue-500)
                                },
                                '&:focus-within': {
                                  borderColor: '#3b82f6', // Matches focus:border-primary
                                },
                              }),
                              menu: (base) => ({
                                ...base,
                                backgroundColor: '#ffffff', // Light mode: white
                                borderRadius: '0.375rem',
                                marginTop: '0.25rem',
                              }),
                              option: (base, { isFocused, isSelected }) => ({
                                ...base,
                                backgroundColor: isSelected
                                  ? '#3b82f6' // blue-500
                                  : isFocused
                                  ? '#eff6ff' // blue-50
                                  : '#ffffff', // white
                                color: isSelected ? '#ffffff' : '#1f2937', // gray-800
                                '&:active': {
                                  backgroundColor: '#2563eb', // blue-600
                                },
                              }),
                              multiValue: (base) => ({
                                ...base,
                                backgroundColor: '#eff6ff', // blue-50
                                borderRadius: '0.25rem',
                              }),
                              multiValueLabel: (base) => ({
                                ...base,
                                color: '#1f2937', // gray-800
                              }),
                              multiValueRemove: (base) => ({
                                ...base,
                                color: '#1f2937', // gray-800
                                '&:hover': {
                                  backgroundColor: '#dbeafe', // blue-100
                                  color: '#2563eb', // blue-600
                                },
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: '#9ca3af', // gray-400
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: '#1f2937', // gray-800
                              }),
                              input: (base) => ({
                                ...base,
                                color: '#1f2937', // gray-800
                              }),
                            }}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: '#3b82f6', // blue-500
                                primary25: '#eff6ff', // blue-50
                                primary50: '#dbeafe', // blue-100
                                neutral0: '#ffffff', // white
                                neutral80: '#1f2937', // gray-800
                              },
                            })}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
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
                      {setting.type === 'single-element-array' && (
                        <div className="flex flex-col gap-2">
                          <Select
                            isClearable
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
                            value={(() => {
                              const rawValue = formData[setting._id];

                              if (typeof rawValue === 'string') {
                                // Handle case where value is a single string key
                                const opt = Array.isArray(setting.options)
                                  ? setting.options.find(
                                      (o) =>
                                        (typeof o === 'object' &&
                                          o.key === rawValue) ||
                                        o === rawValue,
                                    )
                                  : null;

                                const result = opt
                                  ? {
                                      value:
                                        typeof opt === 'object' ? opt.key : opt,
                                      label:
                                        typeof opt === 'object'
                                          ? opt.label
                                          : opt,
                                    }
                                  : null;

                                console.log(
                                  `Single-select: id=${setting._id}, key=${rawValue}, value=`,
                                  result,
                                );
                                return result;
                              }

                              if (
                                Array.isArray(rawValue) &&
                                rawValue.length > 0 &&
                                typeof rawValue[0] === 'object'
                              ) {
                                // Handle array of objects (e.g., [{ key: 'something' }])
                                const selectedKey = rawValue[0].key;

                                const opt = Array.isArray(setting.options)
                                  ? setting.options.find(
                                      (o) =>
                                        (typeof o === 'object' &&
                                          o.key === selectedKey) ||
                                        o === selectedKey,
                                    )
                                  : null;

                                const result = opt
                                  ? {
                                      value:
                                        typeof opt === 'object' ? opt.key : opt,
                                      label:
                                        typeof opt === 'object'
                                          ? opt.label
                                          : opt,
                                    }
                                  : null;

                                console.log(
                                  `Array-based value: id=${setting._id}, key=${selectedKey}, value=`,
                                  result,
                                );
                                return result;
                              }

                              return null;
                            })()}
                            onChange={(selected) =>
                              handleSelectChange(setting._id, selected, setting)
                            }
                            placeholder="Select an option..."
                            className="w-full"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                              control: (base) => ({
                                ...base,
                                backgroundColor: 'transparent',
                                borderColor: '#e5e7eb', // Light mode: gray-200
                                borderRadius: '0.375rem', // Matches rounded-md
                                padding: '0.5rem 1rem', // Matches py-2 px-4
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#3b82f6', // Matches focus:border-primary (blue-500)
                                },
                                '&:focus-within': {
                                  borderColor: '#3b82f6', // Matches focus:border-primary
                                },
                                zIndex: 999,
                              }),
                              menu: (base) => ({
                                ...base,
                                backgroundColor: '#ffffff', // Light mode: white
                                borderRadius: '0.375rem',
                                marginTop: '0.25rem',
                                zIndex: 9999,
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                              option: (base, { isFocused, isSelected }) => ({
                                ...base,
                                backgroundColor: isSelected
                                  ? '#3b82f6' // blue-500
                                  : isFocused
                                  ? '#eff6ff' // blue-50
                                  : '#ffffff', // white
                                color: isSelected ? '#ffffff' : '#1f2937', // gray-800
                                '&:active': {
                                  backgroundColor: '#2563eb', // blue-600
                                },
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: '#9ca3af', // gray-400
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: '#1f2937', // gray-800
                              }),
                              input: (base) => ({
                                ...base,
                                color: '#1f2937', // gray-800
                              }),
                              clearIndicator: (base) => ({
                                ...base,
                                color: '#9ca3af', // gray-400
                                '&:hover': {
                                  color: '#2563eb', // blue-600
                                },
                              }),
                            }}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: '#3b82f6', // blue-500
                                primary25: '#eff6ff', // blue-50
                                primary50: '#dbeafe', // blue-100
                                neutral0: '#ffffff', // white
                                neutral80: '#1f2937', // gray-800
                              },
                            })}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Selected Value:{' '}
                            {formData[setting._id]
                              ? (() => {
                                  const key = formData[setting._id];
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
                                    : 'None';
                                })()
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
