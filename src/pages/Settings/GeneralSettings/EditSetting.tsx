import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  children?: Option[];
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
  options?: string[] | Option[] | boolean;
}

function checkOptionsType(options: any): 'string[]' | 'Option[]' | 'unknown' {
  if (!options || !Array.isArray(options)) {
    return 'unknown';
  }
  if (options.length === 0) {
    return 'unknown';
  }
  const firstElement = options[0];
  if (typeof firstElement === 'string') {
    const allStrings = options.every((item: any) => typeof item === 'string');
    return allStrings ? 'string[]' : 'unknown';
  } else if (
    typeof firstElement === 'object' &&
    firstElement !== null &&
    'key' in firstElement
  ) {
    const allOptions = options.every(
      (item: any) => typeof item === 'object' && item !== null && 'key' in item,
    );
    return allOptions ? 'Option[]' : 'unknown';
  }
  return 'unknown';
}

// Recursive function to flatten options for react-select
const flattenOptions = (
  options: Option[],
  parentLabels: string[] = [],
): { value: string; label: string; status: boolean; path: string }[] => {
  let result: {
    value: string;
    label: string;
    status: boolean;
    path: string;
  }[] = [];
  options.forEach((opt) => {
    const currentPath = [...parentLabels, opt.label].join(' > ');
    result.push({
      value: opt.key,
      label: currentPath,
      status: opt.status,
      path: currentPath,
    });
    if (opt.children && Array.isArray(opt.children)) {
      result = [
        ...result,
        ...flattenOptions(opt.children, [...parentLabels, opt.label]),
      ];
    }
  });
  return result;
};

// Recursive function to find an option by key
const findOptionByKey = (options: Option[], key: string): Option | null => {
  for (const opt of options) {
    if (opt.key === key) {
      return opt;
    }
    if (opt.children && Array.isArray(opt.children)) {
      const found = findOptionByKey(opt.children, key);
      if (found) return found;
    }
  }
  return null;
};

// Recursive function to extract all keys from hierarchical options
const extractAllKeys = (options: Option[]): string[] => {
  let keys: string[] = [];
  options.forEach((opt) => {
    keys.push(opt.key);
    if (opt.children && Array.isArray(opt.children)) {
      keys = [...keys, ...extractAllKeys(opt.children)];
    }
  });
  return keys;
};

// Recursive function to reconstruct hierarchical options
const buildHierarchicalOptions = (
  selectedKeys: string[],
  allOptions: Option[],
): Option[] => {
  const result: Option[] = [];

  const processOption = (opt: Option, parentKeys: string[]): Option | null => {
    const isSelected = selectedKeys.includes(opt.key);
    let children: Option[] = [];

    if (opt.children && Array.isArray(opt.children)) {
      children = opt.children
        .map((child) => processOption(child, [...parentKeys, opt.key]))
        .filter((child): child is Option => child !== null);
    }

    if (isSelected || children.length > 0) {
      return {
        key: opt.key,
        label: opt.label,
        status: opt.status,
        ...(children.length > 0 && { children }),
      };
    }

    return null;
  };

  allOptions.forEach((opt) => {
    const processed = processOption(opt, []);
    if (processed) {
      result.push(processed);
    }
  });

  return result;
};

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
    Record<string, string | string[] | File | boolean>
  >({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Memoize flattened options for all settings
  const flattenedOptionsMap = useMemo(() => {
    const map: Record<
      string,
      { value: string; label: string; status: boolean; path: string }[]
    > = {};
    editableSettings.forEach((setting) => {
      map[setting._id] =
        Array.isArray(setting.options) &&
        checkOptionsType(setting.options) === 'Option[]'
          ? flattenOptions(setting.options as Option[])
          : Array.isArray(setting.options)
          ? (setting.options as string[]).map((opt) => ({
              value: opt,
              label: opt,
              status: false,
              path: opt,
            }))
          : [];
    });
    return map;
  }, [editableSettings]);

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
          setSettings(result.data);
          break;
        }
        case 'admin-settings': {
          if (adminSettings.length === 0) {
            const result = await dispatch(getAdminSettingsAsync()).unwrap();
            setSettings(result.data);
          } else {
            setSettings(adminSettings);
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
  }, [category, dispatch, adminSettings, navigate]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
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

      const newFormData: Record<string, string | string[] | File | boolean> =
        {};
      const newFilePreviews: Record<string, string> = {};

      matchedSettings.forEach((setting) => {
        if (setting.type === 'array') {
          // Handle hierarchical Option[] values
          if (Array.isArray(setting.value)) {
            // Extract all keys, including nested children
            const allKeys = extractAllKeys(setting.value as Option[]);
            newFormData[setting._id] = allKeys;
          } else {
            newFormData[setting._id] = [];
          }
        } else if (setting.type === 'single-element-array') {
          console.log(checkOptionsType(setting.value));
          // newFormData[setting._id] =
          //   Array.isArray(setting.value) && setting.value.length > 0
          //     ? (setting.value as Option[])[0].key
          //     : '';

          if (Array.isArray(setting.value) && setting.value.length > 0) {
            const valueType = checkOptionsType(setting.value);
            newFormData[setting._id] =
              valueType === 'Option[]'
                ? (setting.value as Option[])[0].key
                : valueType === 'string[]'
                ? (setting.value as string[])[0]
                : '';
          } else {
            newFormData[setting._id] = '';
          }
        } else if (setting.type === 'boolean') {
          newFormData[setting._id] = !!setting.value;
        } else if (setting.type === 'image') {
          newFormData[setting._id] = setting.value as string;
        } else {
          newFormData[setting._id] = String(setting.value);
        }

        if (setting.type === 'image' && typeof setting.value === 'string') {
          newFilePreviews[setting._id] = setting.value.startsWith('/uploads')
            ? `${API_URL}${setting.value}`
            : setting.value;
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
          default:
            newValue = value;
        }

        return { ...prev, [id]: newValue };
      });
    },
    [],
  );

  const handleSelectChange = useCallback(
    (id: string, selectedOptions: string[], setting: SettingItem) => {
      let selectedValues: string[] | string;

      if (setting.type === 'array') {
        selectedValues = selectedOptions;
      } else if (setting.type === 'single-element-array') {
        selectedValues = selectedOptions.length > 0 ? selectedOptions[0] : '';
      } else {
        selectedValues = selectedOptions;
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
      let value: string | string[] | boolean | Option[] | File =
        formData[setting._id];

      // Handle array type (multi-select)
      if (setting.type === 'array' && Array.isArray(value)) {
        const selectedKeys = value as string[];
        if (Array.isArray(setting.options)) {
          const optionsType = checkOptionsType(setting.options);
          if (optionsType === 'Option[]') {
            // Rebuild hierarchical options
            value = buildHierarchicalOptions(
              selectedKeys,
              setting.options as Option[],
            );
          } else if (optionsType === 'string[]') {
            value = (setting.options as string[])
              .filter((key) => selectedKeys.includes(key))
              .map((key) => ({
                key,
                label: key,
                status: false,
              }));
          }
        }
      }

      // Handle single-element-array type (single-select)
      if (
        setting.type === 'single-element-array' &&
        typeof value === 'string' &&
        value
      ) {
        if (Array.isArray(setting.options)) {
          const optionsType = checkOptionsType(setting.options);

          if (optionsType === 'Option[]') {
            const selectedOption = findOptionByKey(
              setting.options as Option[],
              value,
            );

            value = selectedOption
              ? [
                  {
                    key: selectedOption.key,
                    label: selectedOption.label,
                    status: selectedOption.status,
                  },
                ]
              : [];
          } else if (optionsType === 'string[]') {
            value = (setting.options as string[]).includes(value)
              ? [value]
              : [];
          }
        } else {
          value = [];
        }
      }

      try {
        let result;

        if (setting.type === 'image') {
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
              value,
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
            [setting._id]:
              setting.type === 'array'
                ? (result.data.value as Option[]).map((opt) => opt.key)
                : setting.type === 'single-element-array' &&
                  Array.isArray(result.data.value) &&
                  result.data.value.length > 0
                ? (result.data.value as Option[])[0].key
                : result.data.value,
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
                                onChange={() => handleToggleChange(setting._id)}
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
                            options={flattenedOptionsMap[setting._id] || []}
                            value={
                              Array.isArray(formData[setting._id])
                                ? (formData[setting._id] as string[])
                                    .map((key) => {
                                      const opt = (
                                        flattenedOptionsMap[setting._id] || []
                                      ).find((o) => o.value === key);
                                      return opt
                                        ? {
                                            value: opt.value,
                                            label: opt.label,
                                            status: opt.status,
                                            path: opt.path,
                                          }
                                        : null;
                                    })
                                    .filter(
                                      (
                                        item,
                                      ): item is {
                                        value: string;
                                        label: string;
                                        status: boolean;
                                        path: string;
                                      } => Boolean(item),
                                    )
                                : []
                            }
                            onChange={(selected) =>
                              handleSelectChange(
                                setting._id,
                                selected
                                  ? selected.map((item) => item.value)
                                  : [],
                                setting,
                              )
                            }
                            placeholder="Select options..."
                            className="w-full"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                              control: (base) => ({
                                ...base,
                                backgroundColor: 'transparent',
                                borderColor: '#e5e7eb',
                                borderRadius: '0.375rem',
                                padding: '0.5rem 1rem',
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#3b82f6',
                                },
                                '&:focus-within': {
                                  borderColor: '#3b82f6',
                                },
                                zIndex: 999,
                              }),
                              menu: (base) => ({
                                ...base,
                                backgroundColor: '#ffffff',
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
                                  ? '#3b82f6'
                                  : isFocused
                                  ? '#eff6ff'
                                  : '#ffffff',
                                color: isSelected ? '#ffffff' : '#1f2937',
                                '&:active': {
                                  backgroundColor: '#2563eb',
                                },
                              }),
                              multiValue: (base) => ({
                                ...base,
                                backgroundColor: '#eff6ff',
                                borderRadius: '0.25rem',
                              }),
                              multiValueLabel: (base) => ({
                                ...base,
                                color: '#1f2937',
                              }),
                              multiValueRemove: (base) => ({
                                ...base,
                                color: '#1f2937',
                                '&:hover': {
                                  backgroundColor: '#dbeafe',
                                  color: '#2563eb',
                                },
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: '#9ca3af',
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: '#1f2937',
                              }),
                              input: (base) => ({
                                ...base,
                                color: '#1f2937',
                              }),
                            }}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: '#3b82f6',
                                primary25: '#eff6ff',
                                primary50: '#dbeafe',
                                neutral0: '#ffffff',
                                neutral80: '#1f2937',
                              },
                            })}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Selected Values:{' '}
                            {Array.isArray(formData[setting._id]) &&
                            (formData[setting._id] as string[]).length > 0
                              ? (formData[setting._id] as string[])
                                  .map((key) => {
                                    const opt = (
                                      flattenedOptionsMap[setting._id] || []
                                    ).find((o) => o.value === key);
                                    return opt ? opt.label : null;
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
                            options={flattenedOptionsMap[setting._id] || []}
                            value={(() => {
                              const rawValue = formData[setting._id];
                              console.log('raw value', rawValue);
                              if (typeof rawValue === 'string' && rawValue) {
                                const opt = (
                                  flattenedOptionsMap[setting._id] || []
                                ).find((o) => o.value === rawValue);
                                return opt
                                  ? {
                                      value: opt.value,
                                      label: opt.label,
                                      status: opt.status,
                                      path: opt.path,
                                    }
                                  : null;
                              }
                              return null;
                            })()}
                            onChange={(selected) =>
                              handleSelectChange(
                                setting._id,
                                selected ? [selected.value] : [],
                                setting,
                              )
                            }
                            placeholder="Select an option..."
                            className="w-full"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                              control: (base) => ({
                                ...base,
                                backgroundColor: 'transparent',
                                borderColor: '#e5e7eb',
                                borderRadius: '0.375rem',
                                padding: '0.5rem 1rem',
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#3b82f6',
                                },
                                '&:focus-within': {
                                  borderColor: '#3b82f6',
                                },
                                zIndex: 999,
                              }),
                              menu: (base) => ({
                                ...base,
                                backgroundColor: '#ffffff',
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
                                  ? '#3b82f6'
                                  : isFocused
                                  ? '#eff6ff'
                                  : '#ffffff',
                                color: isSelected ? '#ffffff' : '#1f2937',
                                '&:active': {
                                  backgroundColor: '#2563eb',
                                },
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: '#9ca3af',
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: '#1f2937',
                              }),
                              input: (base) => ({
                                ...base,
                                color: '#1f2937',
                              }),
                              clearIndicator: (base) => ({
                                ...base,
                                color: '#9ca3af',
                                '&:hover': {
                                  color: '#2563eb',
                                },
                              }),
                            }}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: '#3b82f6',
                                primary25: '#eff6ff',
                                primary50: '#dbeafe',
                                neutral0: '#ffffff',
                                neutral80: '#1f2937',
                              },
                            })}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Selected Value:{' '}
                            {formData[setting._id]
                              ? (() => {
                                  const key = formData[setting._id] as string;
                                  const opt = (
                                    flattenedOptionsMap[setting._id] || []
                                  ).find((o) => o.value === key);
                                  return opt ? opt.label : 'None';
                                })()
                              : 'None'}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-2 text-center">
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
