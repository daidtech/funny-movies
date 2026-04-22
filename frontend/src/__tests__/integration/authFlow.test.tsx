/**
 * Integration tests: test full user flows across multiple components/services.
 */
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

jest.mock('react-bootstrap', () => {
  const MockContainer = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockContainer.displayName = 'MockContainer';

  const MockRow = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockRow.displayName = 'MockRow';

  const MockCol = ({ children, xs, md, sm, lg, xl, ...props }: any) => <div {...props}>{children}</div>;
  MockCol.displayName = 'MockCol';

  const MockForm = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockForm.displayName = 'MockForm';

  const MockFormControl = React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />);
  MockFormControl.displayName = 'MockFormControl';

  const MockButton = ({ children, variant, ...props }: any) => (
    <button data-variant={variant} {...props}>{children}</button>
  );
  MockButton.displayName = 'MockButton';

  return {
    Container: MockContainer,
    Row: MockRow,
    Col: MockCol,
    Form: Object.assign(MockForm, { Control: MockFormControl }),
    Button: MockButton,
  };
});

describe('Integration: Auth flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('full login flow: enter credentials → login → see welcome → logout → see login form', async () => {
    // Start unauthenticated
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce('');

    const user = userEvent.setup();
    render(<Header />);

    // Wait for login form
    await waitFor(() => {
      expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    });

    // Enter credentials
    await user.type(screen.getByPlaceholderText('email'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('password'), 'password123');

    // Mock login success + subsequent getCurrentUser
    (authService.login as jest.Mock).mockResolvedValue({ token: 'jwt-token' });
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({ id: 1, email: 'user@test.com' });

    // Click login
    await user.click(screen.getByText('Login'));

    // Should show welcome message
    await waitFor(() => {
      expect(screen.getByText(/Welcome user@test\.com/)).toBeInTheDocument();
    });

    // Should show Share a movie link and Logout button
    expect(screen.getByText('Share a movie')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Should NOT show login form
    expect(screen.queryByPlaceholderText('email')).not.toBeInTheDocument();

    // Mock logout
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    // Click Logout
    await user.click(screen.getByText('Logout'));

    // Should return to login form
    await waitFor(() => {
      expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it('full registration flow: enter credentials → register → auto-login → see welcome', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce('');

    const user = userEvent.setup();
    render(<Header />);

    await waitFor(() => screen.getByPlaceholderText('email'));

    await user.type(screen.getByPlaceholderText('email'), 'new@user.com');
    await user.type(screen.getByPlaceholderText('password'), 'securepass');

    (authService.register as jest.Mock).mockResolvedValue({ status: { code: 200 } });
    (authService.login as jest.Mock).mockResolvedValue({ token: 'new-jwt' });
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({ id: 2, email: 'new@user.com' });

    await user.click(screen.getByText('Register'));

    // Register → login → getCurrentUser chain
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('new@user.com', 'securepass');
      expect(authService.login).toHaveBeenCalledWith('new@user.com', 'securepass');
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome new@user\.com/)).toBeInTheDocument();
    });
  });

  it('login failure shows error and stays on login form', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue('');

    const user = userEvent.setup();
    render(<Header />);

    await waitFor(() => screen.getByPlaceholderText('email'));

    await user.type(screen.getByPlaceholderText('email'), 'bad@user.com');
    await user.type(screen.getByPlaceholderText('password'), 'wrong');

    (authService.login as jest.Mock).mockRejectedValue(new Error('Email or password is incorrect'));

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email or password is incorrect');
    });

    // Still on login form
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it('register failure shows error and stays on login form', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue('');

    const user = userEvent.setup();
    render(<Header />);

    await waitFor(() => screen.getByPlaceholderText('email'));

    await user.type(screen.getByPlaceholderText('email'), 'dup@user.com');
    await user.type(screen.getByPlaceholderText('password'), 'pass123');

    (authService.register as jest.Mock).mockRejectedValue(new Error('Email already taken'));

    await user.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already taken');
    });

    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
  });
});
