const memoization = require('./memoizaton');
const expect = require('chai').expect;

// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts

describe('memoization', function () {
    it('should memoize function result', () =>{
        let returnValue = 5;
        const testFunction =  (key) => returnValue;

        const memoized = memoization.memoize(testFunction, (key) => key, 1000);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);

        returnValue = 10;

        // TODO currently fails, should work after implementing the memoize function, it should also work with other
        // types then strings, if there are limitations to which types are possible please state them
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
    });

    // TODO additional tests required
});