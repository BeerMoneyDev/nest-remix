import { getHello } from '../test';
describe('test', () => {
  it('should be return msg', () => {
    expect(getHello()).toBe('¡Hello from the new package!');
  });
});
