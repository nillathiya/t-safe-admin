import { useEffect, useState } from 'react';
import Icon from '../../../components/Icons/Icon';
import { ICONS } from '../../../constants';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import {
  createRankSettingAsync,
  deleteRankSettingAsync,
  deleteRowAsync,
  getRankSettingsAsync,
  saveRowAsync,
  updateRankSettingAsync,
} from '../../../features/settings/settingsSlice';
interface DataColumn {
  _id: string;
  slug: string;
  title: string;
  value: string[];
}

export default function DynamicTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { rankSettings, isLoading } = useSelector(
    (state: RootState) => state.settings,
  );
  const isMongoId = (id: string) => /^[a-f\d]{24}$/i.test(id);
  const isUUID = (id: string) =>
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id);

  useEffect(() => {
    const fetchRankSettings = async () => {
      try {
        await dispatch(getRankSettingsAsync()).unwrap();
      } catch (error: any) {
        toast.error(error || 'Server Error');
      }
    };
    if (rankSettings.length == 0) {
      fetchRankSettings();
    }
  }, [dispatch]);

  const [data, setData] = useState<DataColumn[]>(rankSettings);
  const [editingTitles, setEditingTitles] = useState<{ [key: number]: string }>(
    {},
  );

  useEffect(() => {
    setData(rankSettings);
  }, [rankSettings]);

  // Add new row at a specific index
  const addRowAtIndex = (index: number) => {
    setData((prevData) =>
      prevData.map((item) => {
        const newValue = [...item.value];
        newValue.splice(index + 1, 0, '');
        return { ...item, value: newValue };
      }),
    );
  };

  // Remove row at specific index
  const removeRowAtIndex = async (index: number) => {
    const isRowSaved = data.some((col) => col.value[index]?.trim() !== '');

    if (!isRowSaved) {
      setData((prevData) =>
        prevData.map((item) => {
          const newValue = [...item.value];
          newValue.splice(index, 1);
          return { ...item, value: newValue };
        }),
      );
      return;
    }

    try {
      await dispatch(deleteRowAsync({ rowIndex: index })).unwrap();

      setData((prevData) =>
        prevData.map((item) => {
          const newValue = [...item.value];
          newValue.splice(index, 1);
          return { ...item, value: newValue };
        }),
      );
      toast.success('Row deleted successfully!');
    } catch (error: any) {
      toast.error(error || 'Error deleting row.');
    }
  };

  // Add new column
  const addColumn = () => {
    setData((prevData) => {
      const rowCount = Math.max(...prevData.map((d) => d.value.length), 1);
      return [
        ...prevData,
        {
          _id: crypto.randomUUID(), // Generate a temporary ID
          slug: `new_column_${prevData.length + 1}`,
          title: 'New Column',
          value: Array(rowCount).fill(''),
        },
      ];
    });
  };

  // Remove column
  const removeColumn = async (colIndex: number) => {
    const column = data[colIndex];

    const isColumnSaved = column.value.some((val) => val.trim() !== '');
    if (!isColumnSaved) {
      setData((prevData) => prevData.filter((_, index) => index !== colIndex));
      setEditingTitles((prev) => {
        const updatedTitles = { ...prev };
        delete updatedTitles[colIndex];
        return updatedTitles;
      });
      return;
    }

    try {
      await dispatch(deleteRankSettingAsync(column._id)).unwrap();
      setData((prevData) => prevData.filter((_, index) => index !== colIndex));
      setEditingTitles((prev) => {
        const updatedTitles = { ...prev };
        delete updatedTitles[colIndex];
        return updatedTitles;
      });
      toast.success('Column deleted successfully!');
    } catch (error: any) {
      toast.error(error || 'Error deleting column.');
    }
  };

  // Handle value change
  const handleValueChange = (
    colIndex: number,
    rowIndex: number,
    newValue: string,
  ) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[colIndex] = {
        ...updatedData[colIndex],
        value: [...updatedData[colIndex].value],
      };

      updatedData[colIndex].value[rowIndex] = newValue;
      return updatedData;
    });
  };

  // Handle column title change
  const handleTitleChange = (colIndex: number, newTitle: string) => {
    console.log('handle title changed called ...');
    setEditingTitles((prev) => ({ ...prev, [colIndex]: newTitle }));
  };

  // Save column title change
  const saveColumnChange = async (colIndex: number) => {
    const column = data[colIndex];
    const columnValues = column.value;
    const isAllFilled = columnValues.every((val) => val.trim() !== '');

    if (!isAllFilled) {
      toast.error('Please fill all values in this column before saving it.');
      return;
    }
    console.log('colIndex', colIndex);

    setData((prevData) => {
      const updatedData = [...prevData];

      if (editingTitles[colIndex] !== undefined) {
        console.log('Updating title...');

        updatedData[colIndex] = {
          ...updatedData[colIndex],
          title: editingTitles[colIndex],
        };
      }

      return updatedData;
    });

    setEditingTitles((prev) => {
      const updatedTitles = { ...prev };
      delete updatedTitles[colIndex];
      return updatedTitles;
    });

    try {
      const updatedData = {
        title: editingTitles[colIndex] ?? column.title,
        value: column.value,
      };

      if (isMongoId(column._id)) {
        // If it's a MongoDB ObjectId, update the column
        await dispatch(
          updateRankSettingAsync({ id: column._id, formData: updatedData }),
        ).unwrap();
        toast.success('Column updated successfully!');
      } else if (isUUID(column._id)) {
        // If it's a UUID, create a new column
        await dispatch(createRankSettingAsync(updatedData)).unwrap();
        toast.success('Column created successfully!');
      } else {
        toast.error('Invalid column ID format.');
      }
    } catch (error: any) {
      toast.error(error || 'Error saving column value');
    }
  };

  const saveRow = async (rowIndex: number) => {
    const isAllFilled = data.every((col) => col.value[rowIndex]?.trim() !== '');

    if (!isAllFilled) {
      toast.error('Please fill all values in this row before saving.');
      return;
    }

    try {
      await dispatch(
        saveRowAsync({
          rowIndex,
          rowData: data.map((col) => ({
            slug: col.slug,
            value: col.value[rowIndex],
          })),
        }),
      ).unwrap();
      toast.success('Row saved successfully!');
    } catch (error: any) {
      toast.error(error || 'Error saving row.');
    }
    toast.success('Row data are saved successfully!');
  };

  console.log('data', data);
  console.log('editingTitles', editingTitles);
  return (
    <>
      <Breadcrumb pageName="Rank Settings" />
      <div className="rounded-sm border mt-6 border-stroke bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-gray-600 dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="p-4 overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">
              Loading...
            </p>
          ) : data.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">
              No rank settings found.
            </p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 rounded-md dark:border-gray-600">
              <thead>
                <tr>
                  <th className="border p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-28 text-center">
                    Actions
                  </th>
                  {data.map((item, colIndex) => (
                    <th
                      key={colIndex}
                      className="border p-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-900 dark:text-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitles[colIndex] ?? item.title}
                          onChange={(e) =>
                            handleTitleChange(colIndex, e.target.value)
                          }
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <button
                          onClick={() => saveColumnChange(colIndex)}
                          className="text-blue-500 dark:text-blue-400 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Icon Icon={ICONS.SAVE} />
                        </button>
                        <button
                          onClick={() => removeColumn(colIndex)}
                          className="text-red-500 dark:text-red-400 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Icon Icon={ICONS.TRASH} />
                        </button>
                        {colIndex === data.length - 1 && (
                          <button
                            onClick={addColumn}
                            className="bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-full text-sm hover:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            <Icon Icon={ICONS.PLUS} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="border p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-28 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(...data.map((d) => d.value.length), 1),
                }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="bg-white dark:bg-gray-900">
                    <td className="border p-3 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => addRowAtIndex(rowIndex)}
                          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-green-500 dark:text-green-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Icon Icon={ICONS.PLUS} />
                        </button>
                        {data[0]?.value.length > 1 && (
                          <button
                            onClick={() => removeRowAtIndex(rowIndex)}
                            className="text-red-500 dark:text-red-400 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <Icon Icon={ICONS.MINUS} />
                          </button>
                        )}
                      </div>
                    </td>
                    {data.map((item, colIndex) => (
                      <td
                        key={colIndex}
                        className="border p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                      >
                        <input
                          type="text"
                          value={item.value[rowIndex] || ''}
                          onChange={(e) =>
                            handleValueChange(
                              colIndex,
                              rowIndex,
                              e.target.value,
                            )
                          }
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                      </td>
                    ))}
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => saveRow(rowIndex)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700"
                      >
                        <Icon Icon={ICONS.SAVE} />
                        <span className="ml-2">Save Row</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
