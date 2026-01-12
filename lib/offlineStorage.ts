/**
 * Professional Offline Storage Utility
 * Implements a robust caching layer for PWA functionality.
 */

const STORAGE_PREFIX = 'school_app_cache_';
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    version: string;
}

export const offlineStorage = {
    /**
     * Save data to local persistence
     */
    save: <T>(key: string, data: T) => {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
        } catch (e) {
            console.error('Failed to save to offline storage:', e);
        }
    },

    /**
     * Load data from local persistence
     */
    load: <T>(key: string): T | null => {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            if (!item) return null;

            const entry: CacheEntry<T> = JSON.parse(item);

            // Optional: check expiry if needed
            // if (Date.now() - entry.timestamp > CACHE_EXPIRY) return null;

            return entry.data;
        } catch (e) {
            console.error('Failed to load from offline storage:', e);
            return null;
        }
    },

    /**
     * Clear specific cache entry
     */
    remove: (key: string) => {
        localStorage.removeItem(STORAGE_PREFIX + key);
    },

    /**
     * Clear all application cache
     */
    clearAll: () => {
        Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
};
