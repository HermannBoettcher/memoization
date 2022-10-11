const expect = require('chai').expect;
import memoize from './memoizaton';
// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts
const useFakeTimers = require('sinon').useFakeTimers;
const sum = require('lodash').sum;

describe('memoization', function () {
  // generic testing for validity and caching
  const testFunction = ({
    func,
    args,
    key,
    timeout,
  }: {
    func: (...args: any[]) => any;
    args: any[];
    key: (...args: any[]) => any;
    timeout?: number;
  }) => {
    it('should memoize function result', () => {
      const clock = useFakeTimers();
      const memoized = memoize(func, key, timeout, true); // true for debug mode (see memoziation.ts)
      const res = func(...args);

      const testResult = (key, cached: boolean) => {
        const result = memoized(key);
        expect(result.res).to.equal(res);
        expect(result.cached).to.equal(cached);
      };

      testResult(key(...args), false);
      clock.tick(typeof timeout === 'number' ? timeout / 2 : 1000);
      // timeout / 2 < timeout -> still cached
      testResult(key(...args), true);
      clock.tick(typeof timeout === 'number' ? timeout + 1 : 2001);
      // timeout + 1 > timeout -> cache cleared
      testResult(key(...args), false);
    });
  };

  // retest function used above
  testFunction({
    func: () => 5,
    args: ['c544d3ae-a72d-4755-8ce5-d25db415b776'],
    key: (key) => key,
    timeout: 2500,
  });

  // number input (square function)
  testFunction({
    func: (x: number) => x * x,
    args: [5],
    key: (key) => key,
  });

  // multiple number inputs (array sum)
  testFunction({
    func: (ns: number[]) => sum(ns),
    args: [5, 4, 3, 7, 124],
    key: (...args) => sum(args),
  });

  // multiple any inputs (const)
  testFunction({
    func: (a, b, c, d) => 'hello world',
    args: ['hi', 0, {}, undefined],
    key: (...args) => args.map((e) => String(e)).join('_'),
  });
});
