class VideoSerializer
  def initialize(video)
    @video = video
  end

  def as_json
    {
      id: @video.id,
      user_id: @video.user_id,
      title: @video.title,
      youtube_video_hash: @video.youtube_video_hash,
      shared_by: @video&.user&.email,
      description: @video.description,
      created_at: @video.created_at,
      updated_at: @video.updated_at
    }
  end
end