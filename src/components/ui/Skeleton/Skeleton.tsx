import React from "react";
import "./skeleton.css"; 

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = "100%", height = "1rem", className = "" }) => {
  return <div className={`skeleton ${className}`} style={{ width, height }}></div>;
};

export default Skeleton;
