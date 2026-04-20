/**
 * httpClient tests.
 *
 * We capture the interceptor callbacks that httpClient registers on the
 * mocked axios instance, then invoke them directly to verify behaviour.
 */

let requestFulfilled: (config: any) => any;
let requestRejected: (error: any) => any;
let responseFulfilled: (response: any) => any;
let responseRejected: (error: any) => any;

// Capture interceptor callbacks when axios.create is called
jest.mock('axios', () => {
  const createMock = jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((fulfilled: any, rejected: any) => {
          requestFulfilled = fulfilled;
          requestRejected = rejected;
        }),
      },
      response: {
        use: jest.fn((fulfilled: any, rejected: any) => {
          responseFulfilled = fulfilled;
          responseRejected = rejected;
        }),
      },
    },
  }));

  return { __esModule: true, default: { create: createMock } };
});

const mockCookiesGet = jest.fn();
const mockCookiesRemove = jest.fn();

jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockCookiesGet(...args),
    set: jest.fn(),
    remove: (...args: any[]) => mockCookiesRemove(...args),
  },
}));

import axios from 'axios';
import '../../services/httpClient';

describe('httpClient', () => {
  beforeEach(() => {
    mockCookiesGet.mockReset();
    mockCookiesRemove.mockReset();
  });

  it('creates two axios instances (unversioned and versioned)', () => {
    const calls = (axios.create as jest.Mock).mock.calls;
    expect(calls.length).toBe(2);

    expect(calls[0][0]).toEqual(
      expect.objectContaining({ baseURL: 'http://localhost:3000', timeout: 10000 })
    );
    expect(calls[1][0]).toEqual(
      expect.objectContaining({ baseURL: 'http://localhost:3000/api/v1', timeout: 10000 })
    );
  });

  describe('request interceptor', () => {
    it('adds Authorization header when token cookie exists', () => {
      mockCookiesGet.mockReturnValue('test-jwt-token');
      const config = { headers: {} as Record<string, string> };
      const result = requestFulfilled(config);
      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('does not add Authorization header when no token', () => {
      mockCookiesGet.mockReturnValue(undefined);
      const config = { headers: {} as Record<string, string> };
      const result = requestFulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('rejects on request error', async () => {
      const error = new Error('request failed');
      await expect(requestRejected(error)).rejects.toBe(error);
    });
  });

  describe('response interceptor', () => {
    it('passes through successful responses', () => {
      const response = { status: 200, data: {} };
      expect(responseFulfilled(response)).toBe(response);
    });

    it('removes token cookie on 401 response', async () => {
      const error = { response: { status: 401 } };
      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockCookiesRemove).toHaveBeenCalledWith('token');
    });

    it('does not remove token on non-401 errors', async () => {
      const error = { response: { status: 500 } };
      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockCookiesRemove).not.toHaveBeenCalled();
    });
  });
});
