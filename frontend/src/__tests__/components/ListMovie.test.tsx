import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ListMovie from '../../components/ListMovie';
import { getVideos } from '../../services/videoService';

jest.mock('../../services/videoService', () => ({
  getVideos: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn().mockReturnValue(undefined),
}));

jest.mock('@rails/actioncable', () => ({
  createConsumer: jest.fn(() => ({
    subscriptions: {
      create: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    },
    disconnect: jest.fn(),
  })),
}));

jest.mock('react-toastify', () => ({
  toast: Object.assign(jest.fn(), {
    error: jest.fn(),
  }),
}));

jest.mock('react-bootstrap', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Row: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Col: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Card: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Body: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    }
  ),
}));

describe('ListMovie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (getVideos as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves
    render(<ListMovie />);
    expect(screen.getByText('Loading videos...')).toBeInTheDocument();
  });

  it('renders "No videos found" when API returns empty list', async () => {
    (getVideos as jest.Mock).mockResolvedValue([]);
    render(<ListMovie />);

    await waitFor(() => {
      expect(screen.getByText('No videos found')).toBeInTheDocument();
    });
  });

  it('renders video list when API returns data', async () => {
    (getVideos as jest.Mock).mockResolvedValue([
      { id: 1, youtube_video_hash: 'abc', title: 'Video One', description: 'Desc 1', shared_by: 'user@test.com' },
      { id: 2, youtube_video_hash: 'def', title: 'Video Two', description: 'Desc 2', shared_by: 'user2@test.com' },
    ]);

    render(<ListMovie />);

    await waitFor(() => {
      expect(screen.getByText('Video One')).toBeInTheDocument();
      expect(screen.getByText('Video Two')).toBeInTheDocument();
    });
  });

  it('shows error toast when API call fails', async () => {
    const { toast } = require('react-toastify');
    (getVideos as jest.Mock).mockRejectedValue(new Error('fail'));

    render(<ListMovie />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error fetching videos');
    });
  });
});
