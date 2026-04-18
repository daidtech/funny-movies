import { Video } from "../models/video";
import httpClient from "./httpClient";

export const createVideo = async ({youtube_video_hash, title, description}: Video ) => {
  try {
    const response = await httpClient.post('/videos', { video: {youtube_video_hash, title, description} });
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error?.response?.data.status.error);
  }
}

export const getVideos = async () => {
  try {
    const response = await httpClient.get('/videos');
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Error fetching videos');
  }
}