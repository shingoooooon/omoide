'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'skip-link',
        'absolute -top-10 left-6 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium z-50 transition-all duration-200',
        'focus:top-6 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600',
        className
      )}
    >
      {children}
    </a>
  );
}

interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipLinks({ links }: SkipLinksProps) {
  return (
    <div className="sr-only-focusable">
      {links.map((link, index) => (
        <SkipLink key={index} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </div>
  );
}

// Default skip links for the app
export function DefaultSkipLinks() {
  return (
    <SkipLinks
      links={[
        { href: '#main-content', label: 'メインコンテンツにスキップ' },
        { href: '#navigation', label: 'ナビゲーションにスキップ' },
        { href: '#footer', label: 'フッターにスキップ' },
      ]}
    />
  );
}