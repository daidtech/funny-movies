class Api::V1::VideosController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: :index

  def index
    videos = Video.includes(:user).order(created_at: :desc)

    render json: videos.map { |video| VideoSerializer.new(video).to_json }, status: :ok
  end

  def create
    video = current_user.videos.new(video_params)

    if video.save
      SendNotificationJob.perform_later(current_user.id, video.title, current_user.email)

      render json: VideoSerializer.new(video).to_json, status: :created
    else
      render json: { errors: video.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    video = current_user.videos.find_by(id: params[:id])

    return render_video_not_found unless video

    video.destroy
    head :no_content
  end

  private

  def video_params
    params.require(:video).permit(:title, :description, :youtube_video_hash)
  end

  def render_video_not_found
    render json: { error: 'Video not found' }, status: :not_found
  end
end