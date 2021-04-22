import { Logger } from 'winston';
import { Cache } from './cache';
export interface InMemoryCacheEntry {
    timestamp: number;
    data: any;
}
/**
 * This cache implementation stores entries in a map in memory (not efficient for large caches)
 * @example
 * const cache = new InMemoryCache<{bar: string}>({expireAfterSeconds: 600}); // cached entries expire after 10 minutes
 * cache.put('foo', { bar: 'baz' });
 */
export declare class InMemoryCache<T = any> implements Cache<T> {
    private readonly keyValueStore;
    private readonly expireAfterSeconds;
    private readonly logger?;
    private cleanupIntervalRef?;
    constructor({ expireAfterSeconds, logger }: {
        expireAfterSeconds: number;
        logger?: Logger;
    });
    get(key: string): Promise<T>;
    put(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    quit(): Promise<void>;
    private scheduleCleanup;
}
