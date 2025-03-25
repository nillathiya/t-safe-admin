import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportToExcelProps {
  data: any[];
  fileName: string;
}

const ExportToExcel: React.FC<ExportToExcelProps> = ({ data, fileName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileFormat, setFileFormat] = useState<'json' | 'csv' | 'xlsx'>('xlsx');

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    // If no start and end dates are selected, export all data
    let filteredData = data;
    if (startDate && endDate) {
      // Filter data by date range
      filteredData = data.filter((item) => {
        const date = new Date(item.Date); // Assuming each item has a "Date" field
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    if (fileFormat === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const dataBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      saveAs(dataBlob, `${fileName}.xlsx`);
    } else if (fileFormat === 'csv') {
      const csvData = XLSX.utils.sheet_to_csv(
        XLSX.utils.json_to_sheet(filteredData),
      );
      const dataBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      saveAs(dataBlob, `${fileName}.csv`);
    } else if (fileFormat === 'json') {
      const jsonData = JSON.stringify(filteredData, null, 2);
      const dataBlob = new Blob([jsonData], { type: 'application/json' });
      saveAs(dataBlob, `${fileName}.json`);
    }

    // Close the modal after export
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded bg-green-500 py-2 px-4 text-white transition duration-200 ease-in-out hover:bg-green-600"
      >
        Export Data
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl mb-4">Export Options</h3>

            <div className="mb-4">
              <label className="block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">File Format</label>
              <select
                value={fileFormat}
                onChange={(e) =>
                  setFileFormat(e.target.value as 'json' | 'csv' | 'xlsx')
                }
                className="w-full border p-2 rounded"
              >
                <option value="xlsx">Excel (XLSX)</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <button
              onClick={exportToExcel}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Generate Export
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              className="ml-2 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportToExcel;
