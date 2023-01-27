import { isConstructor } from '../utils';

class TestConstructor { }
const testFn = () => { };

describe('utils', () => {
  describe('isConstructor()', () => {
    it('should return true for constructors', () => {
      expect(isConstructor(TestConstructor)).toBeTruthy();
    });
    it('should return false for functions', () => {
      expect(isConstructor(testFn)).toBeFalsy();
    });
  });
});
