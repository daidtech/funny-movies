require 'rails_helper'

RSpec.describe 'Notifications API', type: :request do
  let(:user) { create(:user) }
  let(:video_attributes) do
    {
      title: 'Shared Video',
      description: 'Shared from request spec',
      youtube_video_hash: 'notify_hash_123'
    }
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
  end

  describe 'POST /api/v1/videos' do
    it 'enqueues a notification job after a successful share' do
      expect do
        post '/api/v1/videos', params: { video: video_attributes }, headers: auth_headers_for(user), as: :json
      end.to have_enqueued_job(SendNotificationJob).with(user.id, 'Shared Video', user.email)

      expect(response).to have_http_status(:created)
    end

    it 'does not enqueue a notification job when sharing fails' do
      expect do
        post '/api/v1/videos', params: {
          video: video_attributes.merge(title: '', description: '', youtube_video_hash: '')
        }, headers: auth_headers_for(user), as: :json
      end.not_to have_enqueued_job(SendNotificationJob)

      expect(response).to have_http_status(422)
    end
  end
end