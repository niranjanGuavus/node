import { ResponseTimeMiddleware } from './response-time.middleware';

describe('ResponseTimeMiddleware', () => {
  it('should be defined', () => {
    expect(new ResponseTimeMiddleware()).toBeDefined();
  });
});
