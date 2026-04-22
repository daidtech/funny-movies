import axios from 'axios';
import { Video } from "../models/video";
import httpClient from "./httpClient";

const getVideoErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return 'Error creating video';

  const data = error.response?.data as {
    errors?: string[];
    error?: string;
    status?: { error?: string };
  } | undefined;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(', ');
  }

  return data?.status?.error || data?.error || 'Error creating video';
};

type CreateVideoPayload = Pick<Video, 'youtube_video_hash' | 'title' | 'description'>;

export const createVideo = async ({ youtube_video_hash, title, description }: CreateVideoPayload) => {
  try {
    const response = await httpClient.post('/videos', { video: {youtube_video_hash, title, description} });
    return response.data;
  } catch (error) {
    throw new Error(getVideoErrorMessage(error));
  }
}

export const getVideos = async () => {
  try {
    const response = await httpClient.get('/videos');
    return response.data;
  } catch {
    throw new Error('Error fetching videos');
  }
}