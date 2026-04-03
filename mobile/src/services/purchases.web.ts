// Web stub — react-native-purchases is not available on web
export async function initializePurchases(_userId?: string) {}
export async function getOfferings() { return []; }
export async function purchasePackage(_pkg: any) { return null; }
export async function restorePurchases() { return null; }
export async function getSubscriptionStatus() { return 'trial' as const; }
