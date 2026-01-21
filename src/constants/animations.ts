import type { AnimationType } from '@/types';

export const animationConfig: Record<AnimationType, {
  name: string;
  component: string;
  suggestions: string[];
}> = {
  'progress-bar': {
    name: 'Barre de progression',
    component: 'ProgressBar',
    suggestions: ['general', 'finance', 'education'],
  },
  'progress-circle': {
    name: 'Cercle de progression',
    component: 'CircularProgress',
    suggestions: ['sport', 'health'],
  },
  'fill-container': {
    name: 'Remplissage',
    component: 'FillAnimation',
    suggestions: ['finance', 'nutrition'],
  },
  'grow': {
    name: 'Croissance',
    component: 'GrowAnimation',
    suggestions: ['sport', 'lifestyle'],
  },
  'pulse': {
    name: 'Pulse',
    component: 'PulseAnimation',
    suggestions: ['health', 'lifestyle'],
  },
};

export const ANIMATION_TYPES: AnimationType[] = [
  'progress-bar',
  'progress-circle',
  'fill-container',
  'grow',
  'pulse',
];