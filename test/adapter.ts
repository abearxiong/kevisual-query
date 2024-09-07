import { adapter } from '../src/adapter';
const hostname = 'localhost:3002';

describe('Adapter', () => {
  // 编写一个测试用例
  // yarn test --testNamePattern='Adapter'
  test('Adapter:First', () => {
    adapter({ url: hostname + '/api/router' }).then((res) => {
      expect(res).toEqual({ id: 1 });
    });
  });
});
