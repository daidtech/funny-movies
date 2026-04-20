import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import ShareVideo from '../../components/ShareVideo';
import ListMovie from '../../components/ListMovie';
import { createVideo, getVideos } from '../../services/videoService';
import { createConsumer } from '@rails/actioncable';

jest.mock('../../services/videoService', () => ({
  createVideo: jest.fn(),
  getVideos: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: Object.assign(jest.fn(), {
    error: jest.fn(),
    success: jest.fn(),
  }),
}));

jest.mock('@rails/actioncable', () => ({
  createConsumer: jest.fn(),
}));

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

type SubscriptionCallbacks = {
  received?: (payload: { sender: string; title: string }) => void;
};

describe('Integration: Video sharing flows', () => {
  let subscriptionCallbacks: SubscriptionCallbacks;
  let unsubscribe: jest.Mock;
  let disconnect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    subscriptionCallbacks = {};
    unsubscribe = jest.fn();
    disconnect = jest.fn();

    (createConsumer as jest.Mock).mockReturnValue({
      subscriptions: {
        create: jest.fn((_: string, callbacks: SubscriptionCallbacks) => {
          subscriptionCallbacks = callbacks;
          return { unsubscribe };
        }),
      },
      disconnect,
    });
  });

  it('allows a user to share a YouTube video', async () => {
    (createVideo as jest.Mock).mockResolvedValue({ id: 1 });

    const user = userEvent.setup();
    render(<ShareVideo />);

    await user.type(
      screen.getByLabelText(/Youtube URL/i),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
    await user.type(screen.getByLabelText(/Title/i), 'Never Gonna Give You Up');
    await user.type(screen.getByLabelText(/Description/i), 'Classic music video');
    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => {
      expect(createVideo).toHaveBeenCalledWith({
        youtube_video_hash: 'dQw4w9WgXcQ',
        title: 'Never Gonna Give You Up',
        description: 'Classic music video',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Video shared successfully');
  });

  it('shows a list of shared videos without any vote UI', async () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    (getVideos as jest.Mock).mockResolvedValue([
      {
        id: 1,
        youtube_video_hash: 'hash-1',
        title: 'Funny Cats Compilation',
        description: 'Cats doing funny things',
        shared_by: 'alice@example.com',
      },
      {
        id: 2,
        youtube_video_hash: 'hash-2',
        title: 'Funny Dogs Compilation',
        description: 'Dogs doing funny things',
        shared_by: 'bob@example.com',
      },
    ]);

    render(<ListMovie />);

    await waitFor(() => {
      expect(screen.getByText('Funny Cats Compilation')).toBeInTheDocument();
      expect(screen.getByText('Funny Dogs Compilation')).toBeInTheDocument();
    });

    expect(screen.getByText('Shared by: alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Shared by: bob@example.com')).toBeInTheDocument();
    expect(screen.queryByText(/thumbs up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/thumbs down/i)).not.toBeInTheDocument();
  });

  it('shows a real-time notification and refreshes the shared video list when another user shares a video', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('jwt-token');
    (getVideos as jest.Mock)
      .mockResolvedValueOnce([
        {
          id: 1,
          youtube_video_hash: 'hash-1',
          title: 'Existing Video',
          description: 'Already shared',
          shared_by: 'alice@example.com',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 2,
          youtube_video_hash: 'hash-2',
          title: 'New Shared Video',
          description: 'Freshly shared',
          shared_by: 'bob@example.com',
        },
        {
          id: 1,
          youtube_video_hash: 'hash-1',
          title: 'Existing Video',
          description: 'Already shared',
          shared_by: 'alice@example.com',
        },
      ]);

    render(<ListMovie />);

    await waitFor(() => {
      expect(screen.getByText('Existing Video')).toBeInTheDocument();
    });

    expect(createConsumer).toHaveBeenCalled();

    subscriptionCallbacks.received?.({
      sender: 'bob@example.com',
      title: 'New Shared Video',
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        'bob@example.com shared a new video: "New Shared Video"'
      );
    });

    await waitFor(() => {
      expect(getVideos).toHaveBeenCalledTimes(2);
      expect(screen.getByText('New Shared Video')).toBeInTheDocument();
    });
  });
});