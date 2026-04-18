require 'rails_helper'

RSpec.describe Users::RegistrationsController, type: :controller do
  let(:user) { build(:user) }
  let(:active_user) { create(:user) }
  let(:other_user) { create(:user) }

  before do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  describe 'POST #create' do
    context 'with valid attributes' do
      it 'creates a new user and returns a success response' do
        post :create, params: { user: { email: user.email, password: user.password, password_confirmation: user.password } }, format: :json
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['status']['message']).to eq('Signed up successfully.')
      end
    end

    context 'with invalid attributes' do
      it 'does not create a new user and returns an error response' do
        post :create, params: { user: { email: '', password: '', password_confirmation: '' } }, format: :json
        expect(response).to have_http_status(422)
        expect(JSON.parse(response.body)['status']['error']).not_to be_nil
      end
    end
  end

  describe 'PUT #update' do
    before do
      sign_in active_user
    end

    it 'allows the owner to update their account' do
      patch :update, params: {
        id: active_user.id,
        user: {
          email: 'updated@example.com',
          current_password: 'password123'
        }
      }, format: :json

      expect(response).to have_http_status(:ok)
      expect(active_user.reload.email).to eq('updated@example.com')
    end

    it 'rejects updating another user account' do
      patch :update, params: {
        id: other_user.id,
        user: {
          email: 'hacked@example.com',
          current_password: 'password123'
        }
      }, format: :json

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['status']['error']).to eq('You are not allowed to modify this account.')
    end
  end

  describe 'DELETE #destroy' do
    before do
      sign_in active_user
    end

    it 'rejects deleting another user account' do
      delete :destroy, params: { id: other_user.id }, format: :json

      expect(response).to have_http_status(:forbidden)
      expect(User.exists?(active_user.id)).to eq(true)
      expect(User.exists?(other_user.id)).to eq(true)
      expect(JSON.parse(response.body)['status']['error']).to eq('You are not allowed to modify this account.')
    end
  end
end