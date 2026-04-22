import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../components/Header';
import * as authService from '../../services/authService';
import { toast } from 'react-toastify';

jest.mock('../../services/authService', () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: Object.assign(jest.fn(), {
    error: jest.fn(),
    success: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>;
  MockLink.displayName = 'MockLink';

  return MockLink;
});

jest.mock('lucide-react', () => ({
  House: () => <svg data-testid="house-icon" />,
}));

jest.mock('react-bootstrap', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Row: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Col: ({ children, xs, md, sm, lg, xl, ...props }: any) => <div {...props}>{children}</div>,
  Form: Object.assign(
    (() => {
      const MockForm = ({ children, ...props }: any) => <div {...props}>{children}</div>;
      MockForm.displayName = 'MockForm';

      const MockFormControl = React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />);
      MockFormControl.displayName = 'MockFormControl';

      return MockForm;
    })(),
    {
      Control: (() => {
        const MockFormControl = React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />);
        MockFormControl.displayName = 'MockFormControl';

        return MockFormControl;
      })(),
    }
  ),
  Button: ({ children, variant, ...props }: any) => (
    <button data-variant={variant} {...props}>{children}</button>
  ),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue('');
    });

    it('renders app title', async () => {
      render(<Header />);
      expect(screen.getByText('Funny Movies')).toBeInTheDocument();
    });

    it('renders email and password inputs', async () => {
      render(<Header />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
      });
    });

    it('renders Login and Register buttons', async () => {
      render(<Header />);
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
      });
    });

    it('disables buttons when email/password are empty', async () => {
      render(<Header />);
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeDisabled();
        expect(screen.getByText('Register')).toBeDisabled();
      });
    });

    it('calls login service on Login click', async () => {
      (authService.login as jest.Mock).mockResolvedValue({ token: 'jwt' });
      (authService.getCurrentUser as jest.Mock)
        .mockResolvedValueOnce('')
        .mockResolvedValueOnce({ id: 1, email: 'test@test.com' });

      const user = userEvent.setup();
      render(<Header />);

      await waitFor(() => screen.getByPlaceholderText('email'));

      await user.type(screen.getByPlaceholderText('email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('password'), 'pass123');
      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith('test@test.com', 'pass123');
      });
    });

    it('shows error toast on login failure', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Email or password is incorrect'));

      const user = userEvent.setup();
      render(<Header />);

      await waitFor(() => screen.getByPlaceholderText('email'));

      await user.type(screen.getByPlaceholderText('email'), 'bad@email.com');
      await user.type(screen.getByPlaceholderText('password'), 'wrong');
      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email or password is incorrect');
      });
    });

    it('calls register then login on Register click', async () => {
      (authService.register as jest.Mock).mockResolvedValue({});
      (authService.login as jest.Mock).mockResolvedValue({ token: 'jwt' });
      (authService.getCurrentUser as jest.Mock)
        .mockResolvedValueOnce('')
        .mockResolvedValueOnce({ id: 1, email: 'new@user.com' });

      const user = userEvent.setup();
      render(<Header />);

      await waitFor(() => screen.getByPlaceholderText('email'));

      await user.type(screen.getByPlaceholderText('email'), 'new@user.com');
      await user.type(screen.getByPlaceholderText('password'), 'pass123');
      await user.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith('new@user.com', 'pass123');
        expect(authService.login).toHaveBeenCalledWith('new@user.com', 'pass123');
      });
    });
  });

  describe('authenticated state', () => {
    beforeEach(() => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'user@test.com',
      });
    });

    it('shows welcome message with user email', async () => {
      render(<Header />);
      await waitFor(() => {
        expect(screen.getByText(/Welcome user@test\.com/)).toBeInTheDocument();
      });
    });

    it('shows Share a movie link', async () => {
      render(<Header />);
      await waitFor(() => {
        expect(screen.getByText('Share a movie')).toBeInTheDocument();
      });
    });

    it('shows Logout button', async () => {
      render(<Header />);
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('calls logout and clears user on Logout click', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<Header />);

      await waitFor(() => screen.getByText('Logout'));
      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        // After logout, login form should appear
        expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
      });
    });
  });
});
