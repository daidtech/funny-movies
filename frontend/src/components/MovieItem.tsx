'use client'
import { Card, Row, Col } from 'react-bootstrap';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Video } from '../models/video';

type MovieItemProps = {
  video: Video
}

const MovieItem = ({video}: MovieItemProps) => {
  return (
    <Col md={6}>
      <Card className="mb-4">
        <Card.Body className="p-4">
          <Row className="">
            {/* Video Player */}
            <Col md={6} className='d-flex justify-content-center' style={{ height: '200px' }}>
              <iframe src={`https://www.youtube.com/embed/${video.youtube_video_hash}`}
                title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className='w-100'></iframe>
            </Col>

            {/* Video Info */}
            <Col md={6} className="space-y-2">
              <h2 className="h5 font-weight-bold text-danger">{video.title}</h2>
              <p className="text-muted">Shared by: {video.shared_by}</p>
              <div className="d-flex align-items-center gap-4">
                  <div className="d-flex align-items-center gap-1">
                  <ThumbsUp className="h-4 w-4" style={{ cursor: 'not-allowed' }} />
                  <span>89</span>
                  </div>
                <div className="d-flex align-items-center gap-1">
                  <ThumbsDown className="h-4 w-4" style={{ cursor: 'not-allowed' }}/>
                  <span>12</span>
                </div>
              </div>
                <p className="text-muted">
                  {video.description.length > 90 ? `${video.description.substring(0, 90)}...` : video.description}
                </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  )
}

export default MovieItem;