import { ClipLoader, BarLoader } from 'react-spinners';

interface LoaderProps {
  size: number;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'black' | 'white';
  loader: 'ClipLoader' | 'BarLoader';
  fullPage?: boolean;
}

// Color mapping object
const colorMap: { [key: string]: string } = {
  blue: '#446ab4',
  red: '#e74c3c',
  green: '#2ecc71',
  yellow: '#f1c40f',
  black: '#000000',
  white: '#ffffff',
};

const Loader = ({
  size,
  color = 'blue',
  loader,
  fullPage = false,
}: LoaderProps) => {
  const mappedColor = colorMap[color.toLowerCase()] || color;

  // Full-page loader styles
  const fullPageStyles = fullPage
  ? 'fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50'
  : '';


  return (
    <div className={`${fullPageStyles} flex justify-center items-center`}>
      {loader === 'ClipLoader' ? (
        <ClipLoader size={size} color={mappedColor} />
      ) : (
        <BarLoader width={size * 2} height={size / 4} color={mappedColor} />
      )}
    </div>
  );
};

export default Loader;
