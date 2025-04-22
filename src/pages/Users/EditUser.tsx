import React, { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useParams } from 'react-router-dom';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getAllUserAsync,
  getUserByIdAsync,
  updateUserProfileAsync,
} from '../../features/user/userSlice';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Loader from '../../common/Loader';
import { ethers } from 'ethers';

const EditUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: userId } = useParams();
  const { users, isLoading, user } = useSelector(
    (state: RootState) => state.user,
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [mobile, setMobile] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');

  // Memoize selectedUser to prevent unnecessary recalculations
  const selectedUser = useMemo(
    () => users.find((u) => u._id === userId) || user,
    [users, user, userId],
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      sponsorUCode: '',
      username: '',
      name: '',
      walletAddress: '',
      email: '',
      mobile: '',
      dob: '',
      gender: '',
      accountStatus: {
        blockStatus: 0,
        activeStatus: 0,
      },
    },
    mode: 'onChange', // Enable real-time validation
  });

  const validateWalletAddress = (value: string) => {
    if (!value) return true; // Allow empty (optional field)
    // Check if the address is a valid Ethereum address
    const isValidFormat = ethers.isAddress(value);
    if (!isValidFormat) {
      return 'Invalid wallet address. Must be a valid Ethereum address (e.g., 0x123...).';
    }
    // Check if the address is unique
    const isAddressTaken = users.some(
      (u) =>
        u._id !== selectedUser._id &&
        u.walletAddress.toLowerCase() === value.toLowerCase(),
    );
    if (isAddressTaken) {
      return 'This wallet address is already in use.';
    }
    return true;
  };

  const {
    register: registerResetPassword,
    handleSubmit: handleSubmitResetPasswordForm,
    formState: {
      errors: errorsResetPassword,
      isSubmitting: isResetPasswordFormSubmitting,
    },
  } = useForm();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        if (!users.find((u) => u._id === userId)) {
          await dispatch(getUserByIdAsync(userId)).unwrap();
        }
        if (users.length === 0) {
          await dispatch(getAllUserAsync()).unwrap();
        }
      } catch (error: any) {
        toast.error(error || 'Server error');
      }
    };
    fetchUserData();
  }, [dispatch, userId, users]);

  // Reset form when selectedUser changes or after update
  useEffect(() => {
    if (selectedUser) {
      reset({
        walletAddress: selectedUser?.walletAddress || '',
        sponsorUCode: selectedUser?.sponsorUCode?._id || '',
        username: selectedUser?.username || '',
        name: selectedUser?.name || '',
        email: selectedUser?.email || '',
        mobile: selectedUser?.mobile
          ? `+${
              selectedUser?.address?.countryCode || '91'
            }${selectedUser?.mobile}`
          : '',
        dob: selectedUser?.dob ? selectedUser.dob.split('T')[0] : '',
        gender: selectedUser?.gender || '',
        accountStatus: {
          blockStatus: selectedUser?.accountStatus?.blockStatus || 0,
          activeStatus: selectedUser?.accountStatus?.activeStatus || 0,
        },
      });
      setMobile(selectedUser?.mobile || '');
      setCountryCode(selectedUser?.address?.countryCode || '91');
    }
  }, [selectedUser, reset]);

  const handleFormSubmit = async (data: any) => {
    const updatedData = {
      ...data,
      // Convert empty sponsorUCode to null
      sponsorUCode: data.sponsorUCode || null,
      ...(mobile &&
        countryCode && {
          mobile,
          address: {
            ...data.address,
            countryCode,
          },
        }),
      userId,
    };

    try {
      const result = await dispatch(
        updateUserProfileAsync(updatedData),
      ).unwrap();
      // Reset form with updated data to sync UI
      reset({
        ...data,
        sponsorUCode: result.sponsorUCode?._id || '',
        walletAddress: result.walletAddress || '',
        username: result.username || '',
        name: result.name || '',
        email: result.email || '',
        mobile: result.mobile
          ? `+${result.address?.countryCode || '91'}${result.mobile}`
          : '',
        dob: result.dob ? result.dob.split('T')[0] : '',
        gender: result.gender || '',
        accountStatus: {
          blockStatus: result.accountStatus?.blockStatus || 0,
          activeStatus: result.accountStatus?.activeStatus || 0,
        },
      });
      toast.success('User updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Server error');
    }
  };

  const handlePasswordResetPasswordForm = async (data: any) => {
    const updatedData = {
      ...data,
      userId,
    };
    try {
      await dispatch(updateUserProfileAsync(updatedData)).unwrap();
      toast.success('User Password Updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Server error');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Edit Profile" />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        {isLoading || !selectedUser ? (
          <div className="flex justify-center items-center w-full h-64">
            <Loader loader="ClipLoader" size={50} color="blue" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-9">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Edit Profile
                  </h3>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className="p-6.5">
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                      {/* Sponsor User */}
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Sponsor User
                        </label>
                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                          <Controller
                            name="sponsorUCode"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                              >
                                <option
                                  value=""
                                  className="text-body dark:text-bodydark"
                                >
                                  Select Sponsor
                                </option>
                                {users.map((user) => (
                                  <option
                                    key={user._id}
                                    value={user._id}
                                    className="text-body dark:text-bodydark"
                                  >
                                    {user.username}
                                    {user.name ? ` (${user.name})` : ''}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                            <svg
                              className="fill-current"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g opacity="0.8">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                  fill=""
                                />
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                      {/* Username */}
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Username
                        </label>
                        <input
                          disabled
                          type="text"
                          {...register('username')}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      {/* Name */}
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Name
                        </label>
                        <input
                          type="text"
                          {...register('name')}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      {/* Wallet Address */}
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          User Address/Wallet
                        </label>
                        <input
                          type="text"
                          {...register('walletAddress', {
                            validate: validateWalletAddress,
                          })}
                          placeholder="0x1234567890abcdef1234567890abcdef12345678"
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        {errors.walletAddress?.message && (
                          <p className="text-danger-600 text-sm mt-1">
                            {errors.walletAddress.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Mobile */}
                    <div className="mb-4.5 relative">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Mobile
                      </label>
                      <Controller
                        name="mobile"
                        control={control}
                        rules={{
                          minLength: {
                            value: 10,
                            message: 'Enter a valid phone number',
                          },
                        }}
                        render={({ field }) => (
                          <PhoneInput
                            {...field}
                            inputProps={{
                              ref: field.ref,
                              name: field.name,
                            }}
                            country={'in'}
                            onlyCountries={['us', 'in', 'gb']}
                            placeholder="Enter phone number"
                            containerClass="!w-full !relative !cursor-pointer !transition-all"
                            inputClass="!w-full !rounded !border-[1.5px] !border-stroke !bg-transparent !py-5 !px-10 !text-black !outline-none !transition !focus:!border-primary !active:!border-primary !disabled:!cursor-default !disabled:!bg-whiter dark:!border-form-strokedark dark:!bg-form-input dark:!text-white dark:!focus:!border-primary"
                            buttonClass="!absolute !left-0 !top-0"
                            dropdownClass="!absolute !z-[9999] !max-h-[200px] !overflow-y-auto !border !border-stroke !rounded-md !shadow-lg !bg-white dark:!bg-form-input !text-black dark:!text-white"
                            specialLabel=""
                            onChange={(value: string, data: CountryData) => {
                              const dialCode = data?.dialCode || '';
                              const number = value.replace(`${dialCode}`, '');
                              setCountryCode(dialCode);
                              setMobile(number);
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                      {errors.mobile?.message && (
                        <p className="text-danger-600 text-sm mt-1">
                          {errors.mobile.message}
                        </p>
                      )}
                    </div>
                    {/* Email */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email', {
                          pattern: {
                            value:
                              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                            message: 'Invalid email format',
                          },
                        })}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {errors.email?.message && (
                        <p className="text-danger-600 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    {/* Block Status */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Change Status
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <Controller
                          name="accountStatus.blockStatus"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                              <option
                                value=""
                                className="text-body dark:text-bodydark"
                              >
                                Select Status
                              </option>
                              <option
                                value="1"
                                className="text-body dark:text-bodydark"
                              >
                                Enable
                              </option>
                              <option
                                value="0"
                                className="text-body dark:text-bodydark"
                              >
                                Disable
                              </option>
                            </select>
                          )}
                        />
                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      </div>
                      {errors.accountStatus?.blockStatus?.message && (
                        <p className="text-danger-600 text-sm mt-1">
                          {errors.accountStatus.blockStatus.message}
                        </p>
                      )}
                    </div>
                    {/* Active Status */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Change Active Status
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <Controller
                          name="accountStatus.activeStatus"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                              <option
                                value=""
                                className="text-body dark:text-bodydark"
                              >
                                Select Status
                              </option>
                              <option
                                value="1"
                                className="text-body dark:text-bodydark"
                              >
                                Enable
                              </option>
                              <option
                                value="0"
                                className="text-body dark:text-bodydark"
                              >
                                Disable
                              </option>
                            </select>
                          )}
                        />
                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      </div>
                      {errors.accountStatus?.activeStatus?.message && (
                        <p className="text-danger-600 text-sm mt-1">
                          {errors.accountStatus.activeStatus.message}
                        </p>
                      )}
                    </div>
                    <button
                      className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#5e72e4' }}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'SAVE'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex flex-col gap-9">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <form
                  onSubmit={handleSubmitResetPasswordForm(
                    handlePasswordResetPasswordForm,
                  )}
                >
                  <div className="p-6.5">
                    <div className="mb-4.5 relative">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Set New Password
                      </label>
                      <input
                        {...registerResetPassword('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message:
                              'Password must be at least 6 characters long',
                          },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 pr-12 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute -translate-x-9 top-12 -translate-y-1/2  text-gray-500 dark:text-gray-400"
                        style={{ border: 'none' }}
                      >
                        {showPassword ? (
                          <Icon Icon={ICONS.EYE} className="w-5 h-5" />
                        ) : (
                          <Icon Icon={ICONS.EYEOFF} className="w-5 h-5" />
                        )}
                      </button>
                      {errorsResetPassword.password?.message && (
                        <p className="text-danger-600 text-sm mt-1">
                          {String(errorsResetPassword.password.message)}
                        </p>
                      )}
                    </div>
                    <button
                      className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#5e72e4' }}
                      type="submit"
                      disabled={isResetPasswordFormSubmitting}
                    >
                      {isResetPasswordFormSubmitting
                        ? 'Saving...'
                        : 'SET PASSWORD'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EditUser;
