class SendNotificationJob < ApplicationJob
  queue_as :default

  def perform(user_id, video_title, sender_name)
    User.where.not(id: user_id).find_each do |user|
      NotificationsChannel.broadcast_to(user, {
        title: video_title,
        sender: sender_name,
      })
    end
  end
end