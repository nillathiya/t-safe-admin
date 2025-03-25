import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  ChangeEvent,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import {
  getAllNewsEventsAsync,
  updateNewsEventAsync,
} from '../../../features/news-event/newsEventSlice';
import toast from 'react-hot-toast';
import { NewsEvent } from '../../../types';
import { API_URL, ICONS } from '../../../constants';
import Icon from '../../../components/Icons/Icon';
import Loader from '../../../common/Loader';

function NewsEventList() {
  const dispatch = useDispatch<AppDispatch>();
  const { newsEvents } = useSelector((state: RootState) => state.newsEvent);
  const [activeTab, setActiveTab] = useState<'news' | 'event'>('news');
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [newsEventIsLoading, setNewsEventIsLoading] = useState<boolean>(false);
  const [previews, setPreviews] = useState<{ preview: string; file?: File }[]>(
    [],
  );
  //   Title
  const [editMode, setEditMode] = useState(false);
  //   Description
  const [descriptionEditMode, setDescriptionEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  //   HotLink
  const [hotLinkEditMode, setHotLinkEditMode] = useState<boolean>(false);
  const hotLinkDivRef = useRef<HTMLDivElement>(null);
  //   Tag
  const [tagEditMode, setTagEditMode] = useState<boolean>(false);
  // Images
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  //   Event Date
  const [eventDateEditMode, setEventDateEditMode] = useState(false);
  //   Event Expire
  const [expiresAtEditMode, setExpiresAtEditMode] = useState(false);

  useEffect(() => {
    const fetchAllNewsAndEvents = async () => {
      setNewsEventIsLoading(true);
      try {
        await dispatch(getAllNewsEventsAsync()).unwrap();
      } catch (error: any) {
        toast.error(error || 'Server error');
      } finally {
        setNewsEventIsLoading(false);
      }
    };
    if (newsEvents.length == 0) {
      fetchAllNewsAndEvents();
    }
  }, [dispatch]);

  useEffect(() => {
    if (selectedNews?.images) {
      setPreviews(
        selectedNews.images.map((img) => ({ preview: img })), // Convert string to object
      );
    } else {
      setPreviews([]);
    }
  }, [selectedNews]);

  const { filteredNewsEventData, latestNewsEvents } = useMemo(() => {
    const filtered = newsEvents.filter((item) => item.category === activeTab);

    // Corrected return statement
    return {
      filteredNewsEventData: filtered,
      latestNewsEvents: activeTab === 'news' ? filtered.slice(0, 5) : [],
    };
  }, [activeTab,newsEvents]);

  // Select the first item by default
  useEffect(() => {
    if (filteredNewsEventData.length > 0) {
      setSelectedNews(filteredNewsEventData[0]);
    }
  }, [filteredNewsEventData]);

  const handleUpdate = (
    field: keyof NewsEvent,
    value: string,
    index?: number,
    subField?: string,
  ) => {
    setSelectedNews((prev) => {
      if (!prev) return null;

      if (field === 'tags') {
        const newTags = [...(prev.tags || [])];
        if (index !== undefined) {
          newTags[index] = value;
        }
        return { ...prev, tags: newTags };
      }

      if (field === 'hotlinks' && index !== undefined && subField) {
        const newHotLinks = [...(prev.hotlinks || [])];
        newHotLinks[index] = { ...newHotLinks[index], [subField]: value };

        return { ...prev, hotlinks: newHotLinks };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && editIndex !== null) {
      const file = files[0]; // Get the selected file
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviews((prev) => {
          const updatedPreviews = [...prev];
          updatedPreviews[editIndex] = {
            preview: reader.result as string, // Base64 preview
            file: file, // Store actual file for upload
          };
          return updatedPreviews;
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileClick = (index: number) => {
    setEditIndex(index);
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        hotLinkDivRef.current &&
        !hotLinkDivRef.current.contains(e.target as Node)
      ) {
        setHotLinkEditMode(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleUpdateNewsAndEvent = async () => {
    if (!selectedNews) return;

    const newImages: File[] = [];
    const updateImageIndex: number[] = [];
    const formData = new FormData();

    formData.append('id', selectedNews._id);
    formData.append('title', selectedNews.title);
    formData.append('description', selectedNews.description);
    if (selectedNews.hotlinks.length > 0) {
      formData.append('hotlinks', JSON.stringify(selectedNews.hotlinks));
    }
    if (selectedNews.tags.length > 0) {
      formData.append('tags', JSON.stringify(selectedNews.tags));
    }

    if (selectedNews.eventDate) {
      formData.append(
        'eventDate',
        new Date(selectedNews.eventDate).toISOString(),
      );
    }

    if (selectedNews.expiresAt) {
      formData.append(
        'expiresAt',
        new Date(selectedNews.expiresAt).toISOString(),
      );
    }

    // Fix: Ensure only `File` objects are added
    previews.forEach((item, index) => {
      if (item.file) {
        newImages.push(item.file);
        updateImageIndex.push(index);
      }
    });

    newImages.forEach((file) => {
      formData.append('image', file);
    });

    formData.append('updateImageIndex', JSON.stringify(updateImageIndex));

    try {
      await dispatch(updateNewsEventAsync(formData)).unwrap();
      toast.success('News updated successfully');
    } catch (error: any) {
      toast.error(error || 'Server Error');
    }
  };

  const handleClearButtonClick = () => {
    const originalNews = newsEvents.find(
      (newsEvent) => newsEvent._id === selectedNews?._id,
    );

    if (originalNews) {
      setSelectedNews(originalNews);
    }
  };

  console.log('previews', previews);
  console.log('selectedNews', selectedNews);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Tabs Section */}
      {newsEventIsLoading ? (
        <Loader loader="ClipLoader" size={50} color="blue" />
      ) : (
        <>
          <div className="border-b-2 border-blue-200 dark:border-gray-600 mb-5 flex">
            {['news', 'event'].map((tab) => (
              <h6
                key={tab}
                className={`cursor-pointer px-4 py-2 font-bold text-lg transition-colors duration-300 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab as 'news' | 'event')}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </h6>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side: Selected News/Event */}

            <div className="w-full md:w-2/3 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all">
              {selectedNews ? (
                <>
                  {/* Images Section */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {previews.map((src, index) => {
                        const imageSrc =
                          typeof src === 'string' ? src : src.preview;

                        return (
                          <div key={index} className="relative">
                            <img
                              src={
                                imageSrc.startsWith('/uploads')
                                  ? `${API_URL}${imageSrc}`
                                  : imageSrc
                              }
                              alt="Preview"
                              className="w-full h-24 sm:h-32 object-center rounded-lg border dark:border-gray-600 shadow-md"
                            />
                            <button
                              className="absolute top-1 right-1 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center"
                              onClick={() => handleFileClick(index)}
                            >
                              <Icon Icon={ICONS.EDITPAN} size={18} />
                            </button>
                          </div>
                        );
                      })}

                      {/* <div
                        className="w-full h-24 sm:h-32 flex items-center justify-center rounded-lg border dark:border-gray-600 shadow-md"
                        onClick={handleFileClick}
                      >
                        <Icon Icon={ICONS.PLUS} size={30} />
                      </div> */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}

                  {/* Title Section */}
                  <div className="flex items-center gap-2 mt-4">
                    {editMode ? (
                      <div className="w-full">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Title:
                        </label>
                        <input
                          type="text"
                          value={selectedNews?.title}
                          onChange={(e) =>
                            handleUpdate('title', e.target.value)
                          }
                          className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 capitalize ">
                        {selectedNews.title}
                      </h3>
                    )}
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center "
                    >
                      <Icon Icon={ICONS.EDITPAN} size={18} />
                    </button>
                  </div>

                  {/* Hotlinks Section */}
                  {selectedNews.hotlinks?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedNews.hotlinks.map((hotlink, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <a
                            key={index}
                            href={hotlink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-full shadow-md transition"
                          >
                            🔗 {hotlink.label}
                          </a>
                        </div>
                      ))}
                      <button
                        onClick={() => setHotLinkEditMode(!hotLinkEditMode)}
                        className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center "
                      >
                        <Icon Icon={ICONS.EDITPAN} size={18} />
                      </button>
                    </div>
                  )}

                  {/* Modal or Input for Editing hotLink */}
                  {hotLinkEditMode && (
                    <div className="" ref={hotLinkDivRef}>
                      {selectedNews.hotlinks.map((hotLink, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-3 mt-2"
                        >
                          {/* Label Input */}
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Label:
                            </label>
                            <input
                              type="text"
                              value={hotLink.label}
                              onChange={(e) =>
                                handleUpdate(
                                  'hotlinks',
                                  e.target.value,
                                  index,
                                  'label',
                                )
                              }
                              className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                              placeholder="Enter label"
                            />
                          </div>

                          {/* URL Input */}
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              URL:
                            </label>
                            <input
                              type="url"
                              value={hotLink.url}
                              onChange={(e) =>
                                handleUpdate(
                                  'hotlinks',
                                  e.target.value,
                                  index,
                                  'url',
                                )
                              }
                              className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                              placeholder="Enter URL"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description Section */}
                  <div className="flex items-start gap-2 mt-4">
                    {descriptionEditMode ? (
                      <div className="w-full">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description:
                        </label>
                        <textarea
                          value={selectedNews?.description}
                          onChange={(e) =>
                            handleUpdate('description', e.target.value)
                          }
                          className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={3}
                        ></textarea>
                      </div>
                    ) : (
                      <div className="w-full">
                        <span className="block text-gray-700 dark:text-gray-300 leading-relaxed">
                          {expandedItems[selectedNews._id] ||
                          selectedNews.description.length <= 80
                            ? selectedNews.description
                            : `${selectedNews.description.slice(0, 80)}... `}
                        </span>
                        {selectedNews.description.length > 80 && (
                          <button
                            onClick={() =>
                              setExpandedItems((prev) => ({
                                ...prev,
                                [selectedNews._id]: !prev[selectedNews._id],
                              }))
                            }
                            className="text-blue-500 dark:text-blue-400 text-sm underline mt-1 border-none"
                          >
                            {expandedItems[selectedNews._id]
                              ? 'Show less'
                              : 'Load more'}
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setDescriptionEditMode(!descriptionEditMode)
                      }
                      className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center"
                    >
                      <Icon Icon={ICONS.EDITPAN} size={18} />
                    </button>
                  </div>

                  {/* Tags Section */}
                  {selectedNews.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedNews.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      <button
                        onClick={() => setTagEditMode(!tagEditMode)}
                        className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center "
                      >
                        <Icon Icon={ICONS.EDITPAN} size={18} />
                      </button>
                    </div>
                  )}

                  {/* Edit Tag */}
                  {tagEditMode &&
                    selectedNews?.tags.map((tag, index) => (
                      <div key={index} className="mt-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tag:
                        </label>
                        <input
                          key={index}
                          name="tags"
                          value={tag}
                          onChange={(e) =>
                            handleUpdate('tags', e.target.value, index)
                          }
                          className="w-full p-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    ))}

                  {/* Event Date */}
                  {selectedNews.eventDate && (
                    <div className="mt-2 flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg shadow-sm text-sm">
                      <span className="font-semibold">📅 Event Date:</span>

                      {eventDateEditMode ? (
                        // Show Date Input when in edit mode
                        <input
                          type="date"
                          value={
                            selectedNews.eventDate
                              ? new Date(selectedNews.eventDate)
                                  .toISOString()
                                  .split('T')[0] // Convert Date to "YYYY-MM-DD"
                              : ''
                          }
                          onChange={(e) =>
                            handleUpdate('eventDate', e.target.value)
                          }
                          className="p-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      ) : (
                        // Show Text when not in edit mode
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            selectedNews.eventDate,
                          ).toLocaleDateString()}
                        </span>
                      )}

                      {/* Toggle Button */}
                      <button
                        onClick={() => setEventDateEditMode(!eventDateEditMode)}
                        className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center"
                      >
                        <Icon Icon={ICONS.EDITPAN} size={18} />
                      </button>
                    </div>
                  )}

                  {/* Event Expire */}
                  {selectedNews.expiresAt && (
                    <div className="mt-2 flex items-center gap-1 bg-red-100 dark:bg-red-700 px-3 py-1 rounded-lg shadow-sm text-sm">
                      <span className="font-semibold">⏳ Expires:</span>

                      {expiresAtEditMode ? (
                        // Show Date Input when in edit mode
                        <input
                          type="date"
                          value={
                            selectedNews.expiresAt
                              ? new Date(selectedNews.expiresAt)
                                  .toISOString()
                                  .split('T')[0] // Convert Date to "YYYY-MM-DD"
                              : ''
                          }
                          onChange={(e) =>
                            handleUpdate('expiresAt', e.target.value)
                          }
                          className="p-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      ) : (
                        // Show Text when not in edit mode
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            selectedNews.expiresAt,
                          ).toLocaleDateString()}
                        </span>
                      )}
                      {/* Toggle Button */}
                      <button
                        onClick={() => setExpiresAtEditMode(!expiresAtEditMode)}
                        className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 w-8 h-8 flex items-center justify-center"
                      >
                        <Icon Icon={ICONS.EDITPAN} size={18} />
                      </button>
                    </div>
                  )}
                  {/* Date Section */}
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-3">
                    {new Date(selectedNews.createdAt).toLocaleDateString()}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-center"
                      onClick={handleClearButtonClick}
                    >
                      Clear
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition text-center"
                      onClick={handleUpdateNewsAndEvent}
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No news selected.
                </p>
              )}
            </div>

            {/* Right Side: All News & Events */}
            <div className="md:w-1/3">
              <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-md h-[400px] overflow-y-auto">
                {filteredNewsEventData.length ? (
                  filteredNewsEventData.map((news) => (
                    <div
                      key={news._id}
                      className="mb-4 bg-gray-50 dark:bg-gray-600 p-4 rounded-lg shadow-md"
                      onClick={() => setSelectedNews(news)}
                    >
                      {news.images?.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {news.images.map((src, index) => (
                            <img
                              key={index}
                              src={`${API_URL}${src}`}
                              alt="Preview"
                              className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-500 shadow-sm"
                            />
                          ))}
                        </div>
                      )}

                      <h5 className="mt-2 text-xl font-bold text-gray-900 dark:text-blue-400 cursor-pointer">
                        {news.title}
                      </h5>

                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {news.description.length > 80
                          ? `${news.description.slice(0, 80)}...`
                          : news.description}
                      </p>

                      {news.eventDate && (
                        <div className="mt-2 flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg shadow-sm text-sm">
                          <span className="font-semibold">📅 Event Date:</span>
                          <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(news.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {news.expiresAt && (
                        <div className="mt-2 flex items-center gap-1 bg-red-100 dark:bg-red-700 px-3 py-1 rounded-lg shadow-sm text-sm">
                          <span className="font-semibold">⏳ Expires:</span>
                          <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(news.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(news.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No {activeTab} available.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Latest News & Events */}
          {activeTab === 'news' && (
            <div className="mt-6">
              <aside className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-md">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
                  Latest{' '}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h5>
                <ul className="max-h-96 overflow-y-auto">
                  {latestNewsEvents.length ? (
                    latestNewsEvents.map((news) => (
                      <li
                        key={news._id}
                        onClick={() => setSelectedNews(news)}
                        className="flex items-center cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                      >
                        <div className="ml-4">
                          <h5 className="mt-2 text-xl font-bold text-gray-900 dark:text-blue-400 cursor-pointer">
                            {news.title}
                          </h5>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {new Date(news.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No latest {activeTab} available.
                    </p>
                  )}
                </ul>
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NewsEventList;
