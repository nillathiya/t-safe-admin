import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { AddNewMemberAsync } from '../../features/user/userSlice';

const Reward: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleFormSubmit = async (data: any) => {
    try {
      await dispatch(AddNewMemberAsync(data)).unwrap();
    } catch (error: any) {
      toast.error(error || 'Server Error');
    }
  };
  return (
    <>
      <Breadcrumb pageName="Add member" />

      <div className="flex flex-col gap-9">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <form action="#" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="p-6.5">
              <div className="mb-4.5">
                <input
                  type="text"
                  {...register('sponsorUsername', {
                    required: 'Sponsor username is required',
                  })}
                  placeholder="Sponsor Username"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.sponsorUsername?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.sponsorUsername.message)}
                  </p>
                )}
              </div>
              <div className="mb-4.5">
                <input
                  type="text"
                  {...register('wallet', {
                    required: 'Wallet address is required',
                    pattern: {
                      value: /^0x[a-fA-F0-9]{40}$/,
                      message: 'Invalid Ethereum wallet address',
                    },
                  })}
                  placeholder="Ethereum Wallet Address"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.wallet?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.wallet.message)}
                  </p>
                )}
              </div>

              <button
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                style={{
                  backgroundColor: 'rgb(120 136 255)',
                  border: 'none',
                  textTransform: 'uppercase',
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span>Submitting...</span> : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Reward;
