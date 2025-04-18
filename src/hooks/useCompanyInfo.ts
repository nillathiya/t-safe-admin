// hooks/useCompanyInfo.ts
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { RootState } from '../store/store';
import { ICompanyInfo } from '../types';

export const useCompanyInfo = (
  title: string,
  slug: string,
): string | undefined => {
  const { companyInfo } = useSelector((state: RootState) => state.settings);

  return useMemo(() => {
    return companyInfo.find(
      (data: ICompanyInfo) => data.title === title && data.slug === slug,
    )?.value;
  }, [companyInfo, title, slug]);
};

export const useCompanyInfoValues = (
  criteria: { title: string; slug: string }[],
): (string | undefined)[] => {
  const { companyInfo } = useSelector((state: RootState) => state.settings);

  return useMemo(() => {
    return criteria.map(
      ({ title, slug }) =>
        companyInfo.find(
          (data: ICompanyInfo) => data.title === title && data.slug === slug,
        )?.value,
    );
  }, [companyInfo, criteria]);
};

export const useCompanyCurrency = (): string | undefined => {
  return useCompanyInfo('Company', 'currency');
};
