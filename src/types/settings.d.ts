export interface RankSettings {
  _id?: string;
  title: string;
  slug: string;
  type?: string;
  value: string[];
  status: number;
}

export interface ICompanyInfo {
  _id?: string;
  title: string;
  label: string;
  value: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}
