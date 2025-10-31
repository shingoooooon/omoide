'use client';

import React from 'react';
import {
  CameraIcon,
  BookOpenIcon,
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
  SparklesIcon,
  StarIcon,
  PhotoIcon,
  CogIcon,
  LinkIcon,
  DocumentTextIcon,
  HeartIcon,
  HomeIcon,
  CalendarDaysIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import {
  CameraIcon as CameraSolidIcon,
  BookOpenIcon as BookOpenSolidIcon,
  ChatBubbleLeftEllipsisIcon as ChatBubbleLeftEllipsisSolidIcon,
  UserIcon as UserSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  StarIcon as StarSolidIcon,
  PhotoIcon as PhotoSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

export type IconName = 
  | 'camera'
  | 'book'
  | 'chat'
  | 'user'
  | 'sparkles'
  | 'star'
  | 'photo'
  | 'settings'
  | 'link'
  | 'document'
  | 'heart'
  | 'home'
  | 'calendar'
  | 'bookmark'
  | 'warning'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'refresh'
  | 'share'
  | 'copy'
  | 'clock'
  | 'arrow-left';

interface IconProps {
  name: IconName;
  className?: string;
  solid?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

export function Icon({ name, className = '', solid = false, size = 'md' }: IconProps) {
  const sizeClass = sizeClasses[size];
  const combinedClassName = `${sizeClass} ${className}`;

  const iconMap = {
    camera: solid ? CameraSolidIcon : CameraIcon,
    book: solid ? BookOpenSolidIcon : BookOpenIcon,
    chat: solid ? ChatBubbleLeftEllipsisSolidIcon : ChatBubbleLeftEllipsisIcon,
    user: solid ? UserSolidIcon : UserIcon,
    sparkles: solid ? SparklesSolidIcon : SparklesIcon,
    star: solid ? StarSolidIcon : StarIcon,
    photo: solid ? PhotoSolidIcon : PhotoIcon,
    settings: CogIcon,
    link: LinkIcon,
    document: DocumentTextIcon,
    heart: solid ? HeartSolidIcon : HeartIcon,
    home: HomeIcon,
    calendar: CalendarDaysIcon,
    bookmark: BookmarkIcon,
    warning: ExclamationTriangleIcon,
    plus: PlusIcon,
    edit: PencilIcon,
    trash: TrashIcon,
    close: XMarkIcon,
    'chevron-left': ChevronLeftIcon,
    'chevron-right': ChevronRightIcon,
    refresh: ArrowPathIcon,
    share: ShareIcon,
    copy: ClipboardDocumentIcon,
    clock: ClockIcon,
    'arrow-left': ArrowLeftIcon
  };

  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent className={combinedClassName} />;
}