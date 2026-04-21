import { Video } from "../models/video";
import httpClient from "./httpClient";

const getVideoErrorMessage = (error: unknown) => {
  const responseData = (error as {
    response?: {
      data?: {
        errors?: string[];
        error?: string;
        status?: { error?: string };
      };
    };
  })?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors.join(', ');
  }

  return responseData?.status?.error || responseData?.error || 'Error creating video';
};

export const createVideo = async ({youtube_video_hash, title, description}: Video ) => {
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