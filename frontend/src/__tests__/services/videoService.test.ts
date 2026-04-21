import httpClient from '../../services/httpClient';
import { getVideos, createVideo } from '../../services/videoService';

jest.mock('../../services/httpClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockClient = httpClient as jest.Mocked<typeof httpClient>;

describe('videoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVideos', () => {
    it('returns video list on success', async () => {
      const videos = [
        { id: 1, title: 'Funny Cat', youtube_video_hash: 'abc123', description: 'A cat', shared_by: 'user@test.com' },
        { id: 2, title: 'Funny Dog', youtube_video_hash: 'def456', description: 'A dog', shared_by: 'user2@test.com' },
      ];
      (mockClient.get as jest.Mock).mockResolvedValue({ data: videos });

      const result = await getVideos();

      expect(mockClient.get).toHaveBeenCalledWith('/videos');
      expect(result).toEqual(videos);
    });

    it('throws on API error', async () => {
      (mockClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getVideos()).rejects.toThrow('Error fetching videos');
    });
  });

  describe('createVideo', () => {
    it('posts video data and returns response', async () => {
      const videoData = { youtube_video_hash: 'xyz789', title: 'New Video', description: 'Desc' };
      const responseData = { id: 3, ...videoData };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await createVideo(videoData);

      expect(mockClient.post).toHaveBeenCalledWith('/videos', {
        video: { youtube_video_hash: 'xyz789', title: 'New Video', description: 'Desc' },
      });
      expect(result).toEqual(responseData);
    });

    it('throws server error message on failure', async () => {
      (mockClient.post as jest.Mock).mockRejectedValue({
        response: { data: { status: { error: 'Video already shared' } } },
      });

      await expect(
        createVideo({ youtube_video_hash: 'dup', title: 'T', description: 'D' })
      ).rejects.toThrow('Video already shared');
    });

    it('throws validation errors returned as an errors array', async () => {
      (mockClient.post as jest.Mock).mockRejectedValue({
        response: { data: { errors: ['Youtube video hash has already been taken'] } },
      });

      await expect(
        createVideo({ youtube_video_hash: 'dup', title: 'T', description: 'D' })
      ).rejects.toThrow('Youtube video hash has already been taken');
    });
  });
});
