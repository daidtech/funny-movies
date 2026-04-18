'use client'
import { Container, Row } from 'react-bootstrap';
import MovieItem from './MovieItem';
import { useEffect, useState } from 'react';
import { getVideos } from '../services/videoService';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { createConsumer } from "@rails/actioncable";

export default function ListMovie() {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    await getVideos().then((res) => {
      setVideos(res);
      console.log(res);
    }).catch((err) => {
      console.log(err)
      toast.error('Error fetching videos');
    });
  }

  useEffect(() => {
    fetchVideos();

    const token = Cookies.get('token');

    if (!token) {
      return;
    }

    const protocol = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' ? 'ws' : 'wss';
    const consumer = createConsumer(
      `${protocol}://${process.env.NEXT_PUBLIC_ORIGIN_CABLE}/cable?token=${token}`
    );

    const subscription = consumer.subscriptions.create("NotificationsChannel", {
      received(data) {
        toast(`${data.sender} shared a new video: "${data.title}"`);
        fetchVideos();
      },
    });

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, []);

  return (
    <Container className="py-5">
      <Row>
        {
          videos.length>0 ? videos.map((video: any) => (
            <MovieItem key={video.id} video={video} />
          )) : <p>No videos found</p>
        }
      </Row>
    </Container>
  );
}
