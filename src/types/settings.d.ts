export interface RankSettings {
  _id?: string;
  title: string;
  slug: string;
  type?: string;
  value: string[];
  status: number;
}

export interface ICompanyInfo {
  _id: string;
  name: string;
  title: string;
  slug: string;
  value?: string;
  type:string;
  description?: string;
  adminStatus: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface IAdminSettingParams {
  [key: string]: string | number | boolean | null | undefined; // Or any other types based on your needs
}
