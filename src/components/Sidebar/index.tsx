import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import ArrowIcon from '../Icons/downArrowIcon';
import { ICONS, MENU } from '../../constants';
import Icon from '../Icons/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, persistor } from '../../store/store';
import { adminLogoutAsync, clearUser } from '../../features/auth/authSlice';
// import {
//   PrepareOutAsync,
//   TatumPayoutAsync,
// } from '../../features/payout-reports/payoutReportsSlice';
import toast from 'react-hot-toast';
import { getAllCompanyInfoAsync } from '../../features/settings/settingsSlice';
import { API_URL } from '../../api/routes';
import { useCompanyLogo } from '../../hooks/useCompanyInfo';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const { companyInfo } = useSelector((state: RootState) => state.settings);
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );
  const { currentUser: loggedInUser } = useSelector(
    (state: RootState) => state.auth,
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const handleLogout = () => {
    // dispatch(adminLogoutAsync());
    if (loggedInUser) {
      localStorage.removeItem(`adminToken_${loggedInUser._id}`);
    }
    persistor.purge(); // Non-blocking
    dispatch(clearUser());
    navigate('/');
  };

  // prepare
  const fetchPrepareOut = async () => {
    try {
      // await dispatch(PrepareOutAsync());
    } catch (error: any) {
      toast.error(error);
    }
  };
  // tatum
  const fetchSubmitPayOut = async () => {
    try {
      // await dispatch(TatumPayoutAsync());
    } catch (error: any) {
      toast.error(error);
    }
  };

  const companyLogo =useCompanyLogo() || null;

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black-2 duration-300 ease-linear dark:bg-boxdark-2 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <div className="flex justify-center w-full">
          <NavLink to="/">
            {companyLogo ? (
              <img src={`${API_URL}${companyLogo}`} width={130} height={100} />
            ) : (
              <div className="text-white flex items-center gap-2 justify-center">
                <span className="bg-blue-700 p-1 rounded-lg">
                  <Icon Icon={ICONS.LOGO} className="" />
                </span>
                <span className="text-2xl font-medium">ADMIN PANEL</span>
              </div>
            )}
          </NavLink>
        </div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
          style={{ border: 'none', width: '10%', marginLeft: '10px' }}
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Dynamic Start */}
              {MENU.map((menu) => {
                return (
                  <SidebarLinkGroup
                    key={menu.id}
                    activeCondition={
                      pathname === menu.path ||
                      menu.children.some((child) => pathname === child.path)
                    }

                  >
                    {(handleClick, open) => {
                      return (
                        <>
                          {/* Main Menu Link */}
                          <NavLink
                            to={menu.children.length > 0 ? '#' : menu.path}
                            className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer${
                              (pathname === menu.path ||
                                pathname.includes(menu.path)) &&
                              'bg-graydark dark:bg-meta-4'
                            }`}
                            onClick={(e) => {
                              if (
                                menu.path === '#' &&
                                menu.title === 'Logout'
                              ) {
                                e.preventDefault();
                                handleLogout();
                              }
                              // prepare payout
                              if (
                                menu.path === '/prepare-payout' &&
                                menu.title === 'Prepare payout'
                              ) {
                                fetchPrepareOut();
                              }
                              // tatum
                              if (
                                menu.path === '/submit-payout' &&
                                menu.title === 'Create/Submit payout'
                              ) {
                                fetchSubmitPayOut();
                              }

                              if (menu.children.length > 0) {
                                e.preventDefault();
                                sidebarExpanded
                                  ? handleClick()
                                  : setSidebarExpanded(true);
                              }
                            }}
                          >
                            {/* Icon */}
                            <Icon Icon={ICONS[menu.icon]} size={20} />
                            {/* Title */}
                            {menu.title}
                            {/* Arrow for Dropdown */}
                            {menu.children.length > 0 && (
                              <ArrowIcon
                                open={open}
                                className="absolute right-4 top-1/2 -translate-y-1/2 fill-current"
                              />
                            )}
                          </NavLink>

                          {/* Dropdown Menu */}
                          {menu.children.length > 0 && (
                            <div
                              className={`translate transform overflow-hidden cursor-pointer ${
                                !open && 'hidden'
                              }`}
                            >
                              <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                                {menu.children.map((child) => (
                                  <li key={child.id}>
                                    <NavLink
                                      to={child.path}
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                        (isActive && '!text-white')
                                      }
                                    >
                                      {child.title}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    }}
                  </SidebarLinkGroup>
                );
              })}
              {/* Dynamic End */}
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
