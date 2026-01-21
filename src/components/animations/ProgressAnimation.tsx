import { motion } from 'framer-motion';
import type { AnimationType } from '@/types';
import { getIcon } from '@/constants/icons';

interface ProgressAnimationProps {
  type: AnimationType;
  progress: number; // 0 à 1
  color: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressAnimation({ 
  type, 
  progress, 
  color,
  icon,
  size = 'md' 
}: ProgressAnimationProps) {
  switch (type) {
    case 'progress-bar':
      return <ProgressBar progress={progress} color={color} />;
    case 'progress-circle':
      return <CircularProgress progress={progress} color={color} size={size} />;
    case 'fill-container':
      return <FillAnimation progress={progress} color={color} icon={icon} />;
    case 'grow':
      return <GrowAnimation progress={progress} color={color} icon={icon} />;
    case 'pulse':
      return <PulseAnimation progress={progress} color={color} icon={icon} />;
    default:
      return <ProgressBar progress={progress} color={color} />;
  }
}

// Progress Bar simple
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

// Circular Progress (SVG)
function CircularProgress({ 
  progress, 
  color, 
  size 
}: { 
  progress: number; 
  color: string; 
  size: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 80, md: 120, lg: 160 };
  const dimension = sizes[size];
  const strokeWidth = dimension / 10;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={dimension} height={dimension} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

// Fill Animation (simule une tirelire/container qui se remplit)
function FillAnimation({ 
  progress, 
  color, 
  icon 
}: { 
  progress: number; 
  color: string; 
  icon?: string;
}) {
  const IconComponent = icon ? getIcon(icon) : null;
  
  return (
    <div className="relative w-32 h-40 rounded-2xl border-4 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
      {/* Fill effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ backgroundColor: `${color}40` }}
        initial={{ height: 0 }}
        animate={{ height: `${progress * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {IconComponent ? (
          <IconComponent className="w-12 h-12" style={{ color }} />
        ) : (
          <span className="text-4xl">💰</span>
        )}
      </div>
      {/* Percentage */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-lg font-bold" style={{ color }}>
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

// Grow Animation (icône qui grandit)
function GrowAnimation({ 
  progress, 
  color, 
  icon 
}: { 
  progress: number; 
  color: string; 
  icon?: string;
}) {
  const scale = 0.5 + (progress * 0.5); // Scale de 0.5 à 1
  const IconComponent = icon ? getIcon(icon) : null;
  
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ scale: 0.5, opacity: 0.5 }}
      animate={{ scale, opacity: 0.5 + (progress * 0.5) }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {IconComponent ? (
        <IconComponent className="w-24 h-24" style={{ color }} />
      ) : (
        <span className="text-6xl">💪</span>
      )}
      <span 
        className="mt-2 text-lg font-bold"
        style={{ color }}
      >
        {Math.round(progress * 100)}%
      </span>
    </motion.div>
  );
}

// Pulse Animation
function PulseAnimation({ 
  progress, 
  color, 
  icon 
}: { 
  progress: number; 
  color: string; 
  icon?: string;
}) {
  const IconComponent = icon ? getIcon(icon) : null;
  
  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {IconComponent ? (
        <IconComponent className="w-20 h-20" style={{ color, opacity: progress }} />
      ) : (
        <span className="text-5xl" style={{ opacity: progress }}>❤️</span>
      )}
      <span 
        className="mt-2 text-lg font-bold"
        style={{ color }}
      >
        {Math.round(progress * 100)}%
      </span>
    </motion.div>
  );
}