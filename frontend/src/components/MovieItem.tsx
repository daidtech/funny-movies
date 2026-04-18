'use client'

import { Card, Col, Row } from 'react-bootstrap';
import { Video } from '../models/video';

type MovieItemProps = {
  video: Video
}

const MovieItem = ({ video }: MovieItemProps) => {
  const shortDescription = video.description.length > 90
    ? `${video.description.substring(0, 90)}...`
    : video.description;

  return (
    <Col md={6}>
      <Card className="mb-4">
        <Card.Body className="p-4">
          <Row>
            <Col md={6} className='d-flex justify-content-center' style={{ height: '200px' }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube_video_hash}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className='w-100'
              />
            </Col>

            <Col md={6} className="space-y-2">
              <h2 className="h5 font-weight-bold text-danger">{video.title}</h2>
              <p className="text-muted">Shared by: {video.shared_by || 'Unknown user'}</p>
              <p className="text-muted mb-0">{shortDescription}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default MovieItem;