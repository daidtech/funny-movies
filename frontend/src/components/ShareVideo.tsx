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
      const parsedUrl = new URL(url)
      const searchVideoId = parsedUrl.searchParams.get('v')
      if (searchVideoId) {
        return searchVideoId
      }
      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.replace(/^\//, '')
      }
      return ''
    } catch {
      return ''
    }
  }

  const handleShare = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const youtubeId = getVideoId(youtubeUrl);
    if (!youtubeId) {
      toast.error('Invalid Youtube URL');
      return;
    }
    setIsLoading(true);
    try {
      await createVideo({ youtube_video_hash: youtubeId, title, description });
      cleanForm();
      toast.success('Video shared successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error sharing video';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
              <Form onSubmit={handleShare}>
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
                <Button type="submit" className="w-100" disabled={!youtubeUrl || isLoading}>
                  {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Share'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
export default ShareVideo