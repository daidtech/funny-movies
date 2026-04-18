class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  before_action :authenticate_user!, only: [:update, :destroy]
  before_action :authorize_account_owner!, only: [:update, :destroy]

  # POST /resource
  def create
    super
  end


  # PUT /resource
  def update
    super
  end

  # DELETE /resource
  def destroy
    super
  end

  private

  def authorize_account_owner!
    requested_user_id = params[:id] || params.dig(:user, :id)
    return if requested_user_id.blank? || requested_user_id.to_i == current_user.id

    render json: {
      status: { error: 'You are not allowed to modify this account.' }
    }, status: :forbidden
  end

  def respond_with(current_user, _opts = {})
    if resource.persisted?
      render json: {
        status: {code: 200, message: 'Signed up successfully.'},
        data: UserSerializer.new(current_user).as_json
      }
    else
      render json: {
        status: { error: "#{current_user.errors.full_messages.to_sentence}"}
      }, status: :unprocessable_entity
    end
  end
end