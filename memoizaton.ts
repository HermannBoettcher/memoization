/**
 * Creates a function that memoizes the result of func. If resolver is provided,
 * it determines the cache key for storing the result based on the arguments provided to the memorized function.
 * By default, the first argument provided to the memorized function is used as the map cache key. The memorized values
 * timeout after the timeout exceeds. The timeout is in defined in milliseconds.
 *
 * Example:
 * function addToTime(year, month, day) {
 *  return Date.now() + Date(year, month, day);
 * }
 *
 * const memoized = memoization.memoize(addToTime, (year, month, day) => year + month + day, 5000)
 *
 * // call the provided function cache the result and return the value
 * const result = memoized(1, 11, 26); // result = 1534252012350
 *
 * // because there was no timeout this call should return the memorized value from the first call
 * const secondResult = memoized(1, 11, 26); // secondResult = 1534252012350
 *
 * // after 5000 ms the value is not valid anymore and the original function should be called again
 * const thirdResult = memoized(1, 11, 26); // thirdResult = 1534252159271
 *
 * @param func      the function for which the return values should be cached
 * @param resolver  if provided gets called for each function call with the exact same set of parameters as the
 *                  original function, the resolver function should provide the memoization key.
 * @param timeout   timeout for cached values in milliseconds
 */

const util = require('util');
import { clearInterval } from 'timers';

export type MemoizeFunction<T extends any> = (...args: T[]) => any;

export function memoize(
  func: (...args: any) => any, // the function to cache
  resolver: (...args: any) => any, // resolves the key under which results are saved to the cache
  // could simply standardize by using JSON.stringify(args) !? no need for a resolver then
  timeout?: number, // timeout set for the cache (default will be 2000 ms)
  debug?: boolean // for information on cache status - will return {res: any, cached: boolean}
) {
  let cache: { [key in string]: any } = {};
  let timerId: NodeJS.Timeout;
  let status: { [key in string]: 'pending' | 'fulfilled' | 'error' } = {};
  let resolves = [];
  let rejects = [];

  return async (...args) => {
    // compute key
    const key = String(resolver(...args));
    // check if the function to memoize returns a promise
    const returnsPromise =
      func.constructor.name === 'AsyncFunction' ||
      (typeof func === 'function' && util.types.isPromise(func(...args)));

    // handle functions returning promises
    if (returnsPromise) {
      if (cache[key]) return Promise.resolve(cache[key]);
      if (status[key] === 'pending')
        return new Promise((_res, _rej) => {
          resolves.push(_res);
          rejects.push(_rej);
        });
      try {
        status[key] = 'pending';
        const result = await func(...args);
        status[key] = 'fulfilled';
        cache[key] = function get() {
          // clear cache after timeout
          timerId = setTimeout(() => {
            delete cache[key];
            delete status[key];
            resolves = [].slice();
            rejects = [].slice();
            clearInterval(timerId);
          }, timeout);
          return debug ? { res: result, cached: false } : result;
        };
        resolves.forEach((res) => res(result));
      } catch (err) {
        status[key] = 'error';
        rejects.forEach((rej) => rej(err));
        throw err;
      }

      return debug ? { res: cache[key], cached: true } : cache[key];
    }

    // handle regular functions
    if (key in cache)
      return debug ? { res: cache[key], cached: true } : cache[key];

    cache[key] = func(...args);
    // clear cache after timeout
    timerId = setTimeout(
      () => {
        delete cache[key];
        clearInterval(timerId);
      },
      typeof timeout === 'number' ? timeout : 2000
    );
    return debug ? { res: cache[key], cached: false } : cache[key];
  };
}

export default memoize;
