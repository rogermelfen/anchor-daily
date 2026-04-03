// Web stub — AsyncStorage and NetInfo are not available on web
export async function saveJournalOffline(_entry: any): Promise<void> {}
export async function getPendingEntries(): Promise<any[]> { return []; }
export async function getPendingCount(): Promise<number> { return 0; }
export async function syncPendingEntries() { return { synced: 0, failed: 0, remaining: 0 }; }
export function startSyncListener(): () => void { return () => {}; }
export async function clearPendingEntries(): Promise<void> {}
