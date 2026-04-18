'use client'

import { createConsumer } from '@rails/actioncable';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Video } from '../models/video';
import { getVideos } from '../services/videoService';
import MovieItem from './MovieItem';

type NotificationPayload = {
  sender: string;
  title: string;
};

export default function ListMovie() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await getVideos();
      setVideos(response);
    } catch {
      toast.error('Error fetching videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchVideos();

    const token = Cookies.get('token');

    if (!token) {
      return;
    }

    const protocol = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' ? 'ws' : 'wss';
    const consumer = createConsumer(
      `${protocol}://${process.env.NEXT_PUBLIC_ORIGIN_CABLE}/cable?token=${token}`
    );

    const subscription = consumer.subscriptions.create('NotificationsChannel', {
      received(data: NotificationPayload) {
        toast(`${data.sender} shared a new video: "${data.title}"`);
        void fetchVideos();
      },
    });

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, []);

  if(isLoading) {
    return (
      <Container className="py-5">
        <Row>
          <p>Loading videos...</p>
        </Row>
      </Container>
    );
  }
  return (
    <Container className="py-5">
      <Row>
        {videos.length > 0 ? (
          videos.map((video) => <MovieItem key={video.id} video={video} />)
        ) : (
          <p>No videos found</p>
        )}
      </Row>
    </Container>
  );
}
