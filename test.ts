const expect = require('chai').expect;
import memoize from './memoizaton';
// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts

describe('memoization', function () {
  it('should memoize function result', () => {
    let returnValue = 5;
    const testFunction = (key) => returnValue;
    // const testFunction = (key) => returnValue;

    const memoized = memoize(testFunction, (key) => key, 1000);
    expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);

    returnValue = 10;

    // TODO currently fails, should work after implementing the memoize function, it should also work with other
    // types then strings, if there are limitations to which types are possible please state them
    expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
  });

  // single number input
  it('should memoize function result', () => {
    const testFunction = (x: number) => x * x;

    const memoized = memoize(testFunction, (num) => num, 1000);
    expect(memoized(5)).to.equal(25);

    expect(memoized(5)).to.equal(25);
  });

  // multiple number inputs
  it('should memoize function result', () => {
    const division = (x: number, y: number) => x / y;

    const memoized = memoize(division, (x, y) => `${x}_divided_by_${y}`, 1000);
    expect(memoized(10, 2)).to.equal(5);
    expect(memoized(10, 2)).to.equal(5);
  });

  // multiple any inputs
  it('should memoize function result', () => {
    const anies = (x: any, y: any) => `${x}_and_${y}`;

    const memoized = memoize(anies, (x, y) => `${x}_and_${y}`, 1000);
    expect(memoized(undefined, null)).to.equal('undefined_and_null');
    expect(memoized(undefined, null)).to.equal('undefined_and_null');
  });
});