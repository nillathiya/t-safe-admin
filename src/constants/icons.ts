import { FaHome, FaUser,FaRegCopy } from 'react-icons/fa';
import { AiOutlineSearch } from 'react-icons/ai';
import { RxDashboard } from 'react-icons/rx';
import { BiBarChart } from 'react-icons/bi';
import { IoSettingsOutline } from 'react-icons/io5';
import { MdOutlineContactPage } from 'react-icons/md';
import { CiLogout } from 'react-icons/ci';
import { MdOutlineAreaChart } from 'react-icons/md';
import { MdOutlinePassword } from 'react-icons/md';
import { IoSettings } from 'react-icons/io5';
import { MdOutlineSupport } from 'react-icons/md';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { RiWechatPayLine } from 'react-icons/ri';
import { IoTrophyOutline ,IoTrashOutline} from 'react-icons/io5';
import { FaCommentDollar } from 'react-icons/fa';
import { GiTightrope } from 'react-icons/gi';
import { FaCoins } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { LuDownload } from 'react-icons/lu';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { IoMdEyeOff, IoMdEye } from 'react-icons/io';
import { MdPayments } from 'react-icons/md';
import { IoMdRefresh } from "react-icons/io";
import { FiPlus,FiMinus } from "react-icons/fi";
import { LiaSave } from "react-icons/lia";
import { MdPayment } from 'react-icons/md';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { AiOutlineOrderedList } from 'react-icons/ai';
import { GrMoney } from 'react-icons/gr';
import { RiFundsBoxLine } from 'react-icons/ri';
import { MdOutlineContactPhone } from 'react-icons/md';
import { MdNetworkCheck } from 'react-icons/md';

export const ICONS = {
  HOME: FaHome,
  PAYMENT: MdPayments,
  USER: FaUser,
  SEARCH: AiOutlineSearch,
  DASHBOARD: RxDashboard,
  LOGO: BiBarChart,
  SETTING: IoSettingsOutline,
  CONTACT: MdOutlineContactPage,
  LOGOUT: CiLogout,
  MDOUTLINEAREACHART: MdOutlineAreaChart,
  CILOGOUT: CiLogout,
  MDOUTLINEPASSWORD: MdOutlinePassword,
  IOSETTINGS: IoSettings,
  MDOUTLINESUPPORT: MdOutlineSupport,
  CREATE: MdOutlineCreateNewFolder,
  PAYOUT: RiWechatPayLine,
  REWARDS: IoTrophyOutline,
  DOLLAR: FaCommentDollar,
  TIGHTROPE: GiTightrope,
  Coins: FaCoins,
  CIEDIT: CiEdit,
  MAINBALANCE: MdAccountBalanceWallet,
  DOWNLOAD: LuDownload,
  EDITPAN: MdOutlineModeEditOutline,
  EYEOFF: IoMdEyeOff,
  EYE: IoMdEye,
  REFRESH:IoMdRefresh,
  PLUS:FiPlus,
  MINUS:FiMinus,
  TRASH:IoTrashOutline,
  SAVE:LiaSave,
  WIDTHDRAWAL: BiMoneyWithdraw,
  ORDER: AiOutlineOrderedList,
  INCOME: GrMoney,
  FUND: RiFundsBoxLine,
  CONTACTUs: MdOutlineContactPhone,
  NETWORK: MdNetworkCheck,
  COPY:FaRegCopy,
} as const;
