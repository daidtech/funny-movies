module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private
    def find_verified_user
      token = session_params[:token]
      reject_unauthorized_connection unless token.present?

      user = Warden::JWTAuth::UserDecoder.new.call(token, :user, nil)
      reject_unauthorized_connection unless user

      user
    rescue StandardError
      reject_unauthorized_connection
    end

    def session_params
      request.params
    end
  end
end
