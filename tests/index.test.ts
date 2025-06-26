import { greet } from '../src';

describe('YourApiClient', () => {
  it('should initialize', () => {
    const id = '123';
    const client = greet({ id: id });

    expect(client).toEqual("Hello from tsup!" + id)
  });
});