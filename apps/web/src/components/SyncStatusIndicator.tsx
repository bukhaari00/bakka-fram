'use client';

import React, { useEffect, useState } from 'react';
import { syncEngine, SyncState } from '../lib/sync/syncEngine';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

export function SyncStatusIndicator() {
  const [syncState, setSyncState] = useState<{
    status: SyncState;
    pendingCount: number;
    conflictCount: number;
  }>({
    status: 'ONLINE',
    pendingCount: 0,
    conflictCount: 0
  });
  const [syncingNow, setSyncingNow] = useState(false);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setSyncingNow(true);
    await syncEngine.triggerSync();
    setSyncingNow(false);
  };

  const getStatusBadge = () => {
    switch (syncState.status) {
      case 'OFFLINE':
        return {
          icon: <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />,
          label: 'Offline (Airplane Mode)',
          bg: 'bg-amber-50 text-amber-800 border-amber-300'
        };
      case 'SYNCING':
        return {
          icon: <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />,
          label: 'Syncing Changes...',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300'
        };
      case 'PENDING':
        return {
          icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
          label: `${syncState.pendingCount} Changes Pending`,
          bg: 'bg-blue-50 text-blue-800 border-blue-300'
        };
      case 'CONFLICT':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          label: `${syncState.conflictCount} Conflict(s) Detected`,
          bg: 'bg-rose-50 text-rose-800 border-rose-300'
        };
      case 'REVOKED':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
          label: 'Device Revoked by Admin',
          bg: 'bg-red-50 text-red-800 border-red-300'
        };
      case 'ONLINE':
      default:
        return {
          icon: <Wifi className="w-4 h-4 text-emerald-600" />,
          label: 'Online & Synced',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-sm transition-all ${badge.bg}`}
        title={`Sync status: ${syncState.status}`}
      >
        {badge.icon}
        <span>{badge.label}</span>
      </div>

      <button
        onClick={handleManualSync}
        disabled={syncingNow || syncState.status === 'OFFLINE' || syncState.status === 'REVOKED'}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
        title="Trigger manual cloud sync"
      >
        <RefreshCw className={`w-3 h-3 ${syncingNow ? 'animate-spin' : ''}`} />
        <span>Sync Now</span>
      </button>
    </div>
  );
}
