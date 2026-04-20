import { Video } from "../models/video";
import httpClient from "./httpClient";

export const createVideo = async ({youtube_video_hash, title, description}: Video ) => {
  try {
    const response = await httpClient.post('/videos', { video: {youtube_video_hash, title, description} });
    return response.data;
  } catch (error) {
    const message = (error as { response?: { data?: { status?: { error?: string } } } })
      ?.response?.data?.status?.error;
    throw new Error(message || 'Error creating video');
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