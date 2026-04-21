import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareVideo from '../../components/ShareVideo';
import { createVideo } from '../../services/videoService';
import { toast } from 'react-toastify';

jest.mock('../../services/videoService', () => ({
  createVideo: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: Object.assign(jest.fn(), {
    error: jest.fn(),
    success: jest.fn(),
  }),
}));

// Minimal react-bootstrap mocks
jest.mock('react-bootstrap', () => {
  const MockContainer = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockContainer.displayName = 'MockContainer';

  const MockRow = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockRow.displayName = 'MockRow';

  const MockCol = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockCol.displayName = 'MockCol';

  const MockCard = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockCard.displayName = 'MockCard';

  const MockCardHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockCardHeader.displayName = 'MockCardHeader';

  const MockCardTitle = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockCardTitle.displayName = 'MockCardTitle';

  const MockCardBody = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockCardBody.displayName = 'MockCardBody';

  const MockForm = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockForm.displayName = 'MockForm';

  const MockFormControl = React.forwardRef(({ as, ...props }: any, ref: any) => {
    if (as === 'textarea') return <textarea ref={ref} {...props} />;
    return <input ref={ref} {...props} />;
  });
  MockFormControl.displayName = 'MockFormControl';

  const MockButton = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  MockButton.displayName = 'MockButton';

  return {
    Container: MockContainer,
    Row: MockRow,
    Col: MockCol,
    Card: Object.assign(MockCard, {
      Header: MockCardHeader,
      Title: MockCardTitle,
      Body: MockCardBody,
    }),
    Form: Object.assign(MockForm, {
      Control: MockFormControl,
    }),
    Button: MockButton,
  };
});

describe('ShareVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the share form', () => {
    render(<ShareVideo />);
    expect(screen.getByText('Share a Youtube movie')).toBeInTheDocument();
    expect(screen.getByLabelText(/Youtube URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('disables Share button when YouTube URL is empty', () => {
    render(<ShareVideo />);
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeDisabled();
  });

  it('enables Share button when YouTube URL is entered', async () => {
    const user = userEvent.setup();
    render(<ShareVideo />);

    const urlInput = screen.getByLabelText(/Youtube URL/i);
    await user.type(urlInput, 'https://www.youtube.com/watch?v=abc123');

    const button = screen.getByRole('button', { name: /share/i });
    expect(button).not.toBeDisabled();
  });

  it('parses standard YouTube URL and calls createVideo', async () => {
    (createVideo as jest.Mock).mockResolvedValue({ id: 1 });

    const user = userEvent.setup();
    render(<ShareVideo />);

    await user.type(screen.getByLabelText(/Youtube URL/i), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await user.type(screen.getByLabelText(/Title/i), 'Rick Roll');
    await user.type(screen.getByLabelText(/Description/i), 'Classic');

    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(createVideo).toHaveBeenCalledWith({
        youtube_video_hash: 'dQw4w9WgXcQ',
        title: 'Rick Roll',
        description: 'Classic',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Video shared successfully');
  });

  it('parses youtu.be short URL', async () => {
    (createVideo as jest.Mock).mockResolvedValue({ id: 1 });

    const user = userEvent.setup();
    render(<ShareVideo />);

    await user.type(screen.getByLabelText(/Youtube URL/i), 'https://youtu.be/dQw4w9WgXcQ');
    await user.type(screen.getByLabelText(/Title/i), 'Short URL');

    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(createVideo).toHaveBeenCalledWith(
        expect.objectContaining({ youtube_video_hash: 'dQw4w9WgXcQ' })
      );
    });
  });

  it('shows error toast for invalid URL', async () => {
    const user = userEvent.setup();
    render(<ShareVideo />);

    await user.type(screen.getByLabelText(/Youtube URL/i), 'not-a-url');
    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(createVideo).not.toHaveBeenCalled();
  });

  it('shows the real service error when share fails', async () => {
    (createVideo as jest.Mock).mockRejectedValue(new Error('Youtube video hash has already been taken'));

    const user = userEvent.setup();
    render(<ShareVideo />);

    await user.type(screen.getByLabelText(/Youtube URL/i), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await user.type(screen.getByLabelText(/Title/i), 'Duplicate');
    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Youtube video hash has already been taken');
    });
  });

  it('clears form after successful share', async () => {
    (createVideo as jest.Mock).mockResolvedValue({ id: 1 });

    const user = userEvent.setup();
    render(<ShareVideo />);

    const urlInput = screen.getByLabelText(/Youtube URL/i) as HTMLInputElement;
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;

    await user.type(urlInput, 'https://www.youtube.com/watch?v=abc123');
    await user.type(titleInput, 'My Video');
    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(urlInput.value).toBe('');
      expect(titleInput.value).toBe('');
    });
  });
});
