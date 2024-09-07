import { Query } from './../src/index';

const query = new Query({ url: '/api/router' });

describe('Query', () => {
  // 编写一个测试用例
  // yarn test --testNamePattern='Query'
  test('Query:First', async () => {
    console.log('Query');
  });
});

// test('query', async () => {
//   query.get({ id: 1 }).then((res) => {
//     expect(res).toEqual({ id: 1 });
//   });
// }

// describe('Hello', () => {
//   // 编写一个测试用例
//   // yarn test --testNamePattern='Hello'
//   test('Hello World', () => {
//     console.log('Hello World');
//   });
// });
