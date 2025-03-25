import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <div className="my-4">
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={onChange}
        className="rounded border border-stroke bg-white py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
        style={{ width: '50%', border: 'none' }}
      />
    </div>
  );
};

export default SearchInput;
