import React from 'react';
import { IconBaseProps } from 'react-icons';

interface IconProps extends IconBaseProps {
  Icon: React.ComponentType<IconBaseProps>;
}

const Icon: React.FC<IconProps> = ({
  Icon,
  size = 24,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  return <Icon size={size} color={color} className={className} {...props} />;
};

export default Icon;
