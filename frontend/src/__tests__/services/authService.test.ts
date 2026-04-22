import Cookies from 'js-cookie';
import { httpClientWithoutVersion } from '../../services/httpClient';
import { getCurrentUser, login, register, logout } from '../../services/authService';

jest.mock('../../services/httpClient', () => ({
  httpClientWithoutVersion: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockClient = httpClientWithoutVersion as jest.Mocked<typeof httpClientWithoutVersion>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns user data when token exists', async () => {
      const user = { id: 1, email: 'test@example.com' };
      (Cookies.get as jest.Mock).mockReturnValue('valid-token');
      (mockClient.get as jest.Mock).mockResolvedValue({ data: user });

      const result = await getCurrentUser();

      expect(mockClient.get).toHaveBeenCalledWith('/users/current_user', {
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(result).toEqual(user);
    });

    it('returns empty string when no token', async () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      const result = await getCurrentUser();

      expect(mockClient.get).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('throws on API error', async () => {
      (Cookies.get as jest.Mock).mockReturnValue('valid-token');
      (mockClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getCurrentUser()).rejects.toThrow('Error getting current user');
    });
  });

  describe('login', () => {
    it('stores token cookie and returns response on success', async () => {
      const responseData = { token: 'jwt-123', user: { email: 'a@b.com' } };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await login('a@b.com', 'password123');

      expect(mockClient.post).toHaveBeenCalledWith('/users/sign_in', {
        user: { email: 'a@b.com', password: 'password123' },
      });
      expect(Cookies.set).toHaveBeenCalledWith('token', 'jwt-123', { secure: false, sameSite: 'strict' });
      expect(result).toEqual(responseData);
    });

    it('throws specific message on 401', async () => {
      (mockClient.post as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });

      await expect(login('a@b.com', 'wrong')).rejects.toThrow(
        'Email or password is incorrect'
      );
    });

    it('throws generic message on other errors', async () => {
      (mockClient.post as jest.Mock).mockRejectedValue({
        response: { status: 500 },
      });

      await expect(login('a@b.com', 'pass')).rejects.toThrow('Error logging in');
    });
  });

  describe('register', () => {
    it('returns response data on success', async () => {
      const responseData = { status: { code: 200 } };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await register('new@user.com', 'password');

      expect(mockClient.post).toHaveBeenCalledWith('/users', {
        user: { email: 'new@user.com', password: 'password' },
      });
      expect(result).toEqual(responseData);
    });

    it('throws server error message on failure', async () => {
      (mockClient.post as jest.Mock).mockRejectedValue({
        response: { data: { status: { error: 'Email already taken' } } },
      });

      await expect(register('dup@user.com', 'pass')).rejects.toThrow(
        'Email already taken'
      );
    });
  });

  describe('logout', () => {
    it('calls sign_out and removes cookie', async () => {
      (Cookies.get as jest.Mock).mockReturnValue('valid-token');
      (mockClient.delete as jest.Mock).mockResolvedValue({});

      await logout();

      expect(mockClient.delete).toHaveBeenCalledWith('/users/sign_out', {
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(Cookies.remove).toHaveBeenCalledWith('token');
    });

    it('does nothing when no token', async () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      await logout();

      expect(mockClient.delete).not.toHaveBeenCalled();
      expect(Cookies.remove).not.toHaveBeenCalled();
    });

    it('throws on API error', async () => {
      (Cookies.get as jest.Mock).mockReturnValue('valid-token');
      (mockClient.delete as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(logout()).rejects.toThrow('Error logging out');
    });
  });
});
