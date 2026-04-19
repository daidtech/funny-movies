require 'rails_helper'

RSpec.describe 'Videos API', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }

  describe 'GET /api/v1/videos' do
    before do
      create_list(:video, 2)
    end

    it 'returns the public video feed' do
      get '/api/v1/videos', as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to be_an(Array)
      expect(JSON.parse(response.body).size).to eq(2)
    end
  end

  describe 'POST /api/v1/videos' do
    let(:valid_attributes) do
      {
        title: 'Test Video',
        description: 'Test Description',
        youtube_video_hash: 'unique_hash_123'
      }
    end

    it 'rejects unauthenticated users' do
      post '/api/v1/videos', params: { video: valid_attributes }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it 'creates a video for the authenticated user' do
      expect do
        post '/api/v1/videos', params: { video: valid_attributes }, headers: auth_headers_for(user), as: :json
      end.to change(Video, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it 'rejects duplicate youtube video hashes' do
      create(:video, youtube_video_hash: 'duplicate_hash')

      expect do
        post '/api/v1/videos', params: {
          video: valid_attributes.merge(youtube_video_hash: 'duplicate_hash')
        }, headers: auth_headers_for(user), as: :json
      end.not_to change(Video, :count)

      expect(response).to have_http_status(422)
      expect(JSON.parse(response.body)['errors']).to include('Youtube video hash has already been taken')
    end
  end

  describe 'DELETE /api/v1/videos/:id' do
    it 'allows the owner to delete their video' do
      video = create(:video, user: user)

      expect do
        delete "/api/v1/videos/#{video.id}", headers: auth_headers_for(user), as: :json
      end.to change(Video, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it 'does not allow deleting another user video' do
      video = create(:video, user: other_user)

      expect do
        delete "/api/v1/videos/#{video.id}", headers: auth_headers_for(user), as: :json
      end.not_to change(Video, :count)

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)['error']).to eq('Video not found')
    end
  end
end