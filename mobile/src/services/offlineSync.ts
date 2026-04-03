// ============================================
// Anchor Daily - Offline Journal Sync
// ============================================
// Stores journal entries locally in AsyncStorage when
// the user is offline. When connectivity is restored,
// pending entries are synced to Supabase.
//
// Flow:
// 1. User saves journal entry
// 2. Entry is saved to AsyncStorage immediately (instant feedback)
// 3. If online, also push to Supabase
// 4. If offline, mark as pending sync
// 5. On next app open or connectivity change, sync pending entries
//
// This ensures the user never loses a journal entry.

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import { JournalEntry } from '../types';

const PENDING_ENTRIES_KEY = 'anchor_daily_pending_journal';

interface PendingEntry {
  id: string;
  user_id: string;
  reflection_id?: string;
  content: string;
  created_at: string;
  retries: number;
}

/**
 * Save a journal entry locally and attempt to sync.
 * Returns the entry immediately (optimistic update).
 */
export async function saveJournalOffline(
  entry: Omit<PendingEntry, 'retries'>
): Promise<void> {
  try {
    // Add to pending queue
    const pending = await getPendingEntries();
    pending.push({ ...entry, retries: 0 });
    await AsyncStorage.setItem(PENDING_ENTRIES_KEY, JSON.stringify(pending));

    // Attempt immediate sync
    await syncPendingEntries();
  } catch (error) {
    console.error('[offlineSync] Failed to save locally:', error);
  }
}

/**
 * Get all pending (unsynced) journal entries.
 */
export async function getPendingEntries(): Promise<PendingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get the count of pending entries (for UI badge).
 */
export async function getPendingCount(): Promise<number> {
  const entries = await getPendingEntries();
  return entries.length;
}

/**
 * Attempt to sync all pending journal entries to Supabase.
 * Successfully synced entries are removed from the queue.
 * Failed entries remain for the next attempt (up to 10 retries).
 */
export async function syncPendingEntries(): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    const pending = await getPendingEntries();
    return { synced: 0, failed: 0, remaining: pending.length };
  }

  const pending = await getPendingEntries();
  if (pending.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  console.log(`[offlineSync] Syncing ${pending.length} pending entries...`);

  const stillPending: PendingEntry[] = [];
  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      const { error } = await supabase.from('journal_entries').upsert(
        {
          id: entry.id,
          user_id: entry.user_id,
          reflection_id: entry.reflection_id || null,
          content: entry.content,
          created_at: entry.created_at,
        },
        { onConflict: 'id' }
      );

      if (error) {
        throw error;
      }

      synced++;
      console.log(`[offlineSync] Synced entry ${entry.id}`);
    } catch (error) {
      failed++;
      entry.retries++;

      // Keep retrying up to 10 times
      if (entry.retries < 10) {
        stillPending.push(entry);
      } else {
        console.error(`[offlineSync] Gave up on entry ${entry.id} after 10 retries`);
      }
    }
  }

  // Update the pending queue
  await AsyncStorage.setItem(PENDING_ENTRIES_KEY, JSON.stringify(stillPending));

  console.log(`[offlineSync] Result: ${synced} synced, ${failed} failed, ${stillPending.length} remaining`);

  return { synced, failed, remaining: stillPending.length };
}

/**
 * Set up a listener that automatically syncs when
 * the device regains connectivity.
 * Call this once during app initialization.
 */
export function startSyncListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      console.log('[offlineSync] Connectivity restored — syncing...');
      syncPendingEntries().catch(console.error);
    }
  });

  return unsubscribe;
}

/**
 * Clear all pending entries (e.g., on account deletion).
 */
export async function clearPendingEntries(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_ENTRIES_KEY);
}
