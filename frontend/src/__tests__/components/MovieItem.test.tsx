import React from 'react';
import { render, screen } from '@testing-library/react';
import MovieItem from '../../components/MovieItem';
import { Video } from '../../models/video';

// Mock react-bootstrap to avoid full bootstrap CSS
jest.mock('react-bootstrap', () => {
  const MockCard = ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>;
  MockCard.displayName = 'MockCard';

  const MockCardBody = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockCardBody.displayName = 'MockCardBody';

  const MockCol = ({ children, xs: _xs, md: _md, sm: _sm, lg: _lg, xl: _xl, ...props }: any) => <div {...props}>{children}</div>;
  MockCol.displayName = 'MockCol';

  const MockRow = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockRow.displayName = 'MockRow';

  return {
    Card: Object.assign(MockCard, { Body: MockCardBody }),
    Col: MockCol,
    Row: MockRow,
  };
});

describe('MovieItem', () => {
  const baseVideo: Video = {
    id: 1,
    youtube_video_hash: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    description: 'Official music video for Rick Astley',
    shared_by: 'rick@example.com',
  };

  it('renders the video title', () => {
    render(<MovieItem video={baseVideo} />);
    expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument();
  });

  it('renders the shared by email', () => {
    render(<MovieItem video={baseVideo} />);
    expect(screen.getByText(/Shared by: rick@example\.com/)).toBeInTheDocument();
  });

  it('renders "Unknown user" when shared_by is missing', () => {
    const video = { ...baseVideo, shared_by: undefined };
    render(<MovieItem video={video} />);
    expect(screen.getByText(/Unknown user/)).toBeInTheDocument();
  });

  it('renders the YouTube embed iframe', () => {
    render(<MovieItem video={baseVideo} />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain('youtube.com/embed/dQw4w9WgXcQ');
  });

  it('truncates descriptions longer than 90 characters', () => {
    const longDesc = 'A'.repeat(100);
    const video = { ...baseVideo, description: longDesc };
    render(<MovieItem video={video} />);

    const expected = 'A'.repeat(90) + '...';
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('shows full description when 90 chars or less', () => {
    const shortDesc = 'A short description';
    const video = { ...baseVideo, description: shortDesc };
    render(<MovieItem video={video} />);
    expect(screen.getByText(shortDesc)).toBeInTheDocument();
  });
});
