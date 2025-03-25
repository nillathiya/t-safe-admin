import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { createNewsEventAsync } from '../../../features/news-event/newsEventSlice';
import NewsEventList from './NewsEventList';

function NewAndEvents() {
  const [activeTab, setActiveTab] = useState('news-tab');

  const tabs = [
    { id: 'news-tab', label: 'News' },
    { id: 'event-tab', label: 'Event' },
  ];


  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300 dark:border-gray-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium 
              ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="mt-6">
          {activeTab === 'news-tab' && <NewsTabForm />}
          {activeTab === 'event-tab' && <EventPageForm />}
        </div>
      </div>
      <NewsEventList/>
   
    </>
  );
}
export default NewAndEvents;

// Forms

function NewsTabForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [hotlinks, setHotlinks] = useState<{ label: string; url: string }[]>(
    [],
  );
  const [hotlinkLabel, setHotlinkLabel] = useState('');
  const [hotlinkUrl, setHotlinkUrl] = useState('');

  type FormData = {
    images: FileList;
    title: string;
    description: string;
  };
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      e.preventDefault();
    }
  };

  const addHotlink = () => {
    if (hotlinkLabel.trim() !== '' && hotlinkUrl.trim() !== '') {
      setHotlinks([...hotlinks, { label: hotlinkLabel, url: hotlinkUrl }]);
      setHotlinkLabel('');
      setHotlinkUrl('');
    }
  };

  const removeHotlink = (index: number) => {
    setHotlinks(hotlinks.filter((_, i) => i !== index));
  };
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const imageFiles = watch('images') as unknown as FileList;

  useEffect(() => {
    if (imageFiles && imageFiles.length > 0) {
      const newPreviews: string[] = [];
      Array.from(imageFiles)
        .slice(0, 5)
        .forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === Math.min(imageFiles.length, 5)) {
              setPreviews(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        });
    } else {
      setPreviews([]);
    }
  }, [imageFiles]);
  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', 'news');
    formData.append('tags', JSON.stringify(tags));
    formData.append('hotlinks', JSON.stringify(hotlinks));

    if (imageFiles) {
      Array.from(imageFiles).forEach((file) => {
        formData.append('image', file);
      });
    }
    try {
      await dispatch(createNewsEventAsync(formData)).unwrap();
      toast.success('News Added successfully');
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
    console.log('Form Data:', formData);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Add News
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="mb-4">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            onChange={(e) => setLiveTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            {...register('description')}
            onChange={(e) => setLiveDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Images (Max 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            {...register('images')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>

        {/* Hotlinks Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hotlinks
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Label"
              value={hotlinkLabel}
              onChange={(e) => setHotlinkLabel(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="URL"
              value={hotlinkUrl}
              onChange={(e) => setHotlinkUrl(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded w-1/2"
            />
            <button
              type="button"
              onClick={addHotlink}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {hotlinks.map((hotlink, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md transition-all"
              >
                <a
                  href={hotlink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-blue-600 dark:text-blue-400 font-medium hover:underline truncate"
                >
                  {hotlink.label}
                </a>

                <button
                  type="button"
                  onClick={() => removeHotlink(index)}
                  className="ml-3 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 shadow-md transition-all"
              >
                {tag}
                <button
                  onClick={() => removeTag(index)}
                  className="w-5 h-5 flex items-center justify-center bg-white text-blue-600 rounded-full hover:bg-gray-200 hover:text-red-500 transition"
                >
                  &times;
                </button>
              </span>
            ))}

            <input
              type="text"
              placeholder="Add tags (Press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="p-1 bg-transparent outline-none w-32 text-gray-900 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-center"
        >
          {isSubmitting ? <span>Submitting...</span> : 'Add News'}
        </button>
      </form>

      {/* Live Preview Section */}
      <div className="mt-6 p-6 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Live Preview
        </h3>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {previews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Title Preview */}
        {liveTitle && (
          <p className="mt-3 text-xl font-bold text-gray-900 dark:text-gray-200">
            {liveTitle}
          </p>
        )}

        {/* Description Preview */}
        {liveDescription && (
          <p className="mt-2 text-gray-700 dark:text-gray-400 leading-relaxed">
            {liveDescription}
          </p>
        )}

        {/* Tags Preview */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Hotlinks Preview */}
        {hotlinks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
              Hotlinks:
            </h4>
            <div className="flex flex-wrap gap-2">
              {hotlinks.map((hotlink, index) => (
                <a
                  key={index}
                  href={hotlink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full shadow-md transition"
                >
                  🔗 {hotlink.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventPageForm() {
  const dispatch = useDispatch<AppDispatch>();

  // Live preview states
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [liveEventDate, setLiveEventDate] = useState('');
  const [liveExpiryDate, setLiveExpiryDate] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', 'event');
    formData.append('eventDate', data.eventDate);
    formData.append('expiresAt', data.expiresAt);

    try {
      await dispatch(createNewsEventAsync(formData)).unwrap();
      toast.success('Event Added successfully');
    } catch (error: any) {
      toast.error(error || 'Server error');
    }
    // console.log('Form Data:', formData);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Add Event
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="mb-4">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            onChange={(e) => setLiveTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
          {errors.title?.message && (
            <p className="text-red-500 text-sm mt-1">
              {String(errors.title.message)}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            {...register('description')}
            onChange={(e) => setLiveDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          ></textarea>
        </div>

        {/* Event Date */}
        <div className="mb-4">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Event Date <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            {...register('eventDate', { required: 'Event date is required' })}
            type="date"
            onChange={(e) => setLiveEventDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
          {errors.eventDate?.message && (
            <p className="text-red-500">{String(errors.eventDate.message)}</p>
          )}
        </div>

        {/* Expiry Date (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Expiry Date (Optional)
          </label>
          <input
            {...register('expiresAt')}
            type="date"
            onChange={(e) => setLiveExpiryDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-center"
        >
          {isSubmitting ? <span>Submitting...</span> : 'Add News'}
        </button>
      </form>

      {/* Live Preview Section */}
      <div className="mt-6 p-6 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Live Preview
        </h3>

        {/* Title Preview */}
        {liveTitle && (
          <p className="mt-3 text-xl font-bold text-gray-900 dark:text-gray-200">
            {liveTitle}
          </p>
        )}

        {/* Description Preview */}
        {liveDescription && (
          <p className="mt-2 text-gray-700 dark:text-gray-400 leading-relaxed">
            {liveDescription}
          </p>
        )}

        {/* Event Date Preview */}
        {liveEventDate && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            📅 Event Date: {new Date(liveEventDate).toLocaleDateString()}
          </p>
        )}

        {/* Expiry Date Preview */}
        {liveExpiryDate && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            ⏳ Expiry Date: {new Date(liveExpiryDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
