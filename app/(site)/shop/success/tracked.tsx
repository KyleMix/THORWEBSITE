'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
export function Tracked({ sessionId }: { sessionId?: string }) {
  useEffect(() => { if (sessionId) track('checkout_completed'); }, [sessionId]);
  return null;
}
