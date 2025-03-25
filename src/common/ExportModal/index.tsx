import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Column {
  label: string;
  key: string;
  format?: (value: any, index?: number) => string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  filename: string;
  columns: Column[];
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  filename,
  columns,
}) => {
  if (!isOpen) return null;

  // 🟢 Export as PDF
  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.text(`${filename} Report`, 14, 10);

    const tableData = data.map((row, index) =>
      columns.map((col) =>
        col.format ? col.format(row[col.key], index) : row[col.key] || 'N/A',
      ),
    );

    autoTable(doc, {
      head: [columns.map((col) => col.label)],
      body: tableData,
    });

    doc.save(`${filename}.pdf`);
  };

  // 🟢 Export as Excel
  const exportAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => {
        const formattedRow: Record<string, any> = {};
        columns.forEach((col) => {
          formattedRow[col.label] = col.format
            ? col.format(row[col.key], index)
            : row[col.key] || 'N/A';
        });
        return formattedRow;
      }),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, filename);
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileData = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(fileData, `${filename}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Export Data
        </h2>
        <div className="flex flex-col gap-3 text-center">
          <button
            onClick={exportAsPDF}
            className="bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition"
          >
            Export as PDF
          </button>
          <button
            onClick={exportAsExcel}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Export as Excel
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white py-3 rounded-md hover:bg-gray-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
