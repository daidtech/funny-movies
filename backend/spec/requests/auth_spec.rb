require 'rails_helper'

RSpec.describe 'Auth API', type: :request do
  describe 'POST /users' do
    it 'registers a user with valid attributes' do
      post '/users', params: {
        user: {
          email: 'auth@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig('status', 'message')).to eq('Signed up successfully.')
    end

    it 'returns an error with invalid attributes' do
      post '/users', params: {
        user: {
          email: '',
          password: '',
          password_confirmation: ''
        }
      }, as: :json

      expect(response).to have_http_status(422)
      expect(JSON.parse(response.body).dig('status', 'error')).to be_present
    end
  end

  describe 'POST /users/sign_in' do
    let!(:user) { create(:user, email: 'login@example.com', password: 'password123', password_confirmation: 'password123') }

    it 'logs in with valid credentials' do
      post '/users/sign_in', params: {
        user: {
          email: user.email,
          password: 'password123'
        }
      }, as: :json

      body = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(body['message']).to eq('Logged in successfully.')
      expect(body['token']).to be_present
    end

    it 'rejects invalid credentials' do
      post '/users/sign_in', params: {
        user: {
          email: user.email,
          password: 'wrong-password'
        }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /users/current_user' do
    let(:user) { create(:user) }

    it 'returns the authenticated user' do
      get '/users/current_user', headers: auth_headers_for(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['email']).to eq(user.email)
    end

    it 'rejects unauthenticated requests' do
      get '/users/current_user', as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end
end