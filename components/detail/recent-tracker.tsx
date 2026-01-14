'use client';

import { useEffect } from 'react';
import { useRecentIndicators } from '@/lib/storage';

interface RecentTrackerProps {
  codigo: string;
}

export function RecentTracker({ codigo }: RecentTrackerProps) {
  const { addRecent } = useRecentIndicators();

  useEffect(() => {
    addRecent(codigo);
  }, [codigo, addRecent]);

  return null;
}
