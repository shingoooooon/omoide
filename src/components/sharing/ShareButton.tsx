'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  contentId: string;
  contentType: 'record' | 'storybook';
  contentTitle?: string;
  className?: string;
}

export function ShareButton({ 
  contentId, 
  contentType, 
  contentTitle,
  className 
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <Icon name="share" className="w-4 h-4 mr-2" />
        共有
      </Button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={contentId}
        contentType={contentType}
        contentTitle={contentTitle}
      />
    </>
  );
}