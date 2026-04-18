'use client'
import { useState } from "react"
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import { createVideo } from "../services/videoService"
import { toast } from "react-toastify"

const ShareVideo = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [youtubeUrl, setYoutubeUrl] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  const getVideoId = (url: string) => {
    try {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get('v') ? urlParams.get('v') : '';
    } catch (error) {
      toast.error('Invalid Youtube URL format');
      console.log('error', error)
      setIsLoading(false);
      return '';
    }
  }

  const handleShare = () => {
    setIsLoading(true);
    const youtubeId = getVideoId(youtubeUrl);
    if(!youtubeId) {
      toast.error('Invalid Youtube URL');
      return;
    }
    createVideo({youtube_video_hash: youtubeId, title, description}).then(() => {
      cleanForm();
      toast.success('Video shared successfully');
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
      console.log(err);
      toast.error('Error sharing video');
    });
  }

  const cleanForm = () => {
    setYoutubeUrl("");
    setTitle("");
    setDescription("");
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6} className="mx-auto">
          <Card className="w-100 mx-auto">
            <Card.Header>
              <Card.Title>Share a Youtube movie</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label htmlFor="youtube-url" className="form-label">
                  Youtube URL:
                </label>
                <Form.Control
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v="
                  />
              </div>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title:
                </label>
                <Form.Control
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  />
              </div>
                <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description:
                </label>
                <Form.Control
                  as="textarea"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  />
                </div>
                <Button className="w-100" onClick={handleShare} disabled={!youtubeUrl || isLoading}>
                {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Share'}
                </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
export default ShareVideo