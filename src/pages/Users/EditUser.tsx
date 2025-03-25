import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useParams } from 'react-router-dom';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getUserByIdAsync,
  updateUserProfileAsync,
} from '../../features/user/userSlice';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Loader from '../../common/Loader';

const EditUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: userId } = useParams();
  const { users, user } = useSelector((state: RootState) => state.user);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // contactNumber:
  const [contactNumber, setcontactNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState('');

  // console.log('contactNumber', contactNumber);
  // console.log('countryCode', countryCode);

  useEffect(() => {
    if (!userId) return;

    const existingUser = users.find((user) => user._id === userId);
    if (!existingUser) {
      dispatch(getUserByIdAsync(userId))
        .unwrap()
        .catch((error: any) => {
          toast.error(error || 'Server error');
        });
    }
  }, [userId, users, dispatch]);

  const selectedUser = users?.find((user) => user._id === userId) || user;
  // console.log('selectedUser', selectedUser);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // ✅ Use reset to update form values dynamically
  } = useForm({
    defaultValues: {
      username: '',
      name: '',
      email: '',
      contactNumber: '',
      dob: '',
      gender: '',
      accountStatus: {
        blockStatus: 0,
        activeStatus: 0,
      },
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (selectedUser) {
      reset({
        username: selectedUser?.username || '',
        name: selectedUser?.name || '',
        email: selectedUser?.email || '',
        contactNumber: selectedUser?.contactNumber,
        dob: selectedUser?.dob ? selectedUser.dob.split('T')[0] : '',
        gender: selectedUser?.gender || '',
        accountStatus: {
          blockStatus: selectedUser?.accountStatus?.blockStatus || 0,
          activeStatus: selectedUser?.accountStatus?.activeStatus || 0,
        },
      });
    }
  }, [selectedUser, reset]);

  const {
    register: registerResetPassword,
    handleSubmit: handleSubmitResetPasswordForm,
    formState: {
      errors: errorsResetPassword,
      isSubmitting: isResetPasswordFormSubmitting,
    },
  } = useForm();

  const handleFormSubmit = async (data: any) => {
    console.log('contactNumber', contactNumber);
    console.log('countryCode', countryCode);
    const sanitizedCountryCode = countryCode.replace(/\D/g, '');
    const fullContactNumber = `${sanitizedCountryCode}${contactNumber}`;

    const updatedData = {
      ...data,
      ...(contactNumber &&
        sanitizedCountryCode && {
          contactNumber: fullContactNumber,
          // address: {
          //   ...data.address,
          //   countryCode: sanitizedCountryCode,
          // },
        }),
      userId,
    };

    try {
      await dispatch(updateUserProfileAsync(updatedData)).unwrap();
      toast.success('User updated successfully');
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
  };

  const handlePasswordResetPasswordForm = async (data: any) => {
    // console.log('Submitting data:', data);
    const updatedData = {
      ...data,
      userId,
    };
    try {
      await dispatch(updateUserProfileAsync(updatedData)).unwrap();
      toast.success('User Password Updated successfully');
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Edit Profile" />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        {!selectedUser ? (
          <Loader loader="ClipLoader" size={50} color="blue" />
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
                    </div>
                    {/* contactNumber */}
                    <div className="mb-4.5 relative overflow-visible ">
                      <label className="mb-2.5 block text-black dark:text-white w-full">
                        contactNumber
                      </label>
                      <Controller
                        name="contactNumber"
                        control={control}
                        rules={{
                          // required: "Phone number is required",
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
                            containerClass="!w-full !relative  !cursor-pointer !transition-all "
                            inputClass="!w-full !rounded !border-[1.5px] !border-stroke !bg-transparent !py-5 !px-10 !text-black !outline-none !transition !focus:!border-primary !active:!border-primary !disabled:!cursor-default !disabled:!bg-whiter dark:!border-form-strokedark dark:!bg-form-input dark:!text-white dark:!focus:!border-primary "
                            buttonClass="!absolute !left-0 !top-0"
                            dropdownClass="!absolute !z-[9999] !max-h-[200px] !overflow-y-auto !border !border-stroke !rounded-md !shadow-lg !bg-white dark:!bg-form-input !text-black dark:!text-white hover:dark:!bg"
                            specialLabel=""
                            // enableSearch={true}
                            onChange={(value: string, data: CountryData) => {
                              const dialCode = data?.dialCode || '';
                              const number = value.replace(`${dialCode}`, '');
                              console.log('dialCode', dialCode);
                              console.log('number', number);

                              setCountryCode(dialCode);
                              setcontactNumber(number);
                            }}
                          />
                        )}
                      />
                      {errors.contactNumber && (
                        <p className="error-message !text-danger-600">
                          {errors.contactNumber.message}
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
                        <p className="text-red-500 text-sm mt-1">
                          {String(errors.email.message)}
                        </p>
                      )}
                    </div>

                    {/* user block status */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Change Status
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <Controller
                          name="accountStatus.blockStatus"
                          control={control}
                          // rules={{ required: 'Status is required' }}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                              <option value="">Select Status</option>
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
                        <span className="absolute top-1/2 right-6 z-30 -translate-y-1/2">
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
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                      {errors.accountStatus?.blockStatus?.message && (
                        <p className="text-red-500 text-sm mt-1">
                          {String(errors.accountStatus.blockStatus.message)}
                        </p>
                      )}
                    </div>
                    {/* user active status */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Change Active Status
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <Controller
                          name="accountStatus.activeStatus"
                          control={control}
                          // rules={{ required: 'Active status is required' }}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                              <option value="">Select Status</option>
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
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                      {errors.accountStatus?.activeStatus?.message && (
                        <p className="text-red-500 text-sm mt-1">
                          {String(errors.accountStatus.activeStatus.message)}
                        </p>
                      )}
                    </div>

                    <button
                      className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                      style={{ backgroundColor: '#5e72e4' }}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <span>Saving...</span> : 'SAVE'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
              <div className="flex flex-col gap-9">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <form
                    action="#"
                    onSubmit={handleSubmitResetPasswordForm(
                      handlePasswordResetPasswordForm,
                    )}
                  >
                    <div className="p-6.5">
                      <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                        <div className="w-full relative">
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

                          {/* Toggle Password Visibility Button */}
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[50%] -translate-y-1/2 text-gray-500 dark:text-gray-400"
                            style={{ border: 'none', width: '6%' }}
                          >
                            {showPassword ? (
                              <Icon Icon={ICONS.EYE} className="w-5 h-5" />
                            ) : (
                              <Icon Icon={ICONS.EYEOFF} className="w-5 h-5" />
                            )}
                          </button>

                          {/* Display Error Message */}
                          {errorsResetPassword.password?.message && (
                            <p className="text-red-500 text-sm mt-1">
                              {String(errorsResetPassword.password.message)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        style={{ backgroundColor: '#5e72e4' }}
                        type="submit"
                        disabled={isResetPasswordFormSubmitting}
                      >
                        {isResetPasswordFormSubmitting ? (
                          <span>Saving...</span>
                        ) : (
                          'SET PASSWORD'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EditUser;
