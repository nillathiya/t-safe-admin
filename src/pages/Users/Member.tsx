import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { AddNewMemberAsync } from '../../features/user/userSlice';

interface FormData {
  username: string;
  email: string;
  password: string;
  sponsorUsername: string;
  wallet: string;
}

const Member: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const handleFormSubmit = async (data: FormData) => {
    try {
      await dispatch(AddNewMemberAsync(data)).unwrap();
      toast.success('User registered successfully!');
    } catch (error: any) {
      toast.error(error || 'Failed to register user');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Add Member" />

      <div className="flex flex-col gap-9">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Register New Member
            </h3>
          </div>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="p-6.5">
              {/* Username Field */}
              <div className="mb-4.5">
                <label className="!mb-2.5 block text-black dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  })}
                  placeholder="Enter username"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.username?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-4.5">
                <label className="!mb-2.5 block text-black dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="Enter email"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.email?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-4.5">
                <label className="!mb-2.5 block text-black dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    // minLength: {
                    //   value: 6,
                    //   message: 'Password must be at least 6 characters',
                    // },
                  })}
                  placeholder="Enter password"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.password?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sponsor Username Field */}
              <div className="mb-4.5">
                <label className="!mb-2.5 block text-black dark:text-white">
                  Sponsor Username
                </label>
                <input
                  type="text"
                  {...register('sponsorUsername', {
                    // required: 'Sponsor username is required',
                  })}
                  placeholder="Enter sponsor username"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.sponsorUsername?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sponsorUsername.message}
                  </p>
                )}
              </div>

              {/* Wallet Address Field */}
              <div className="mb-4.5">
                <label className="!mb-2.5 block text-black dark:text-white">
                  Ethereum Wallet Address
                </label>
                <input
                  type="text"
                  {...register('wallet', {
                    // required: 'Wallet address is required',
                    pattern: {
                      value: /^0x[a-fA-F0-9]{40}$/,
                      message: 'Invalid Ethereum wallet address',
                    },
                  })}
                  placeholder="Enter Ethereum wallet address"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.wallet?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.wallet.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                style={{
                  backgroundColor: 'rgb(120 136 255)',
                  border: 'none',
                  textTransform: 'uppercase',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Member;
