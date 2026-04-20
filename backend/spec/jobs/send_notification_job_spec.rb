require 'rails_helper'

RSpec.describe SendNotificationJob, type: :job do
  let!(:sender) { create(:user) }
  let!(:recipient) { create(:user) }
  let(:video_title) { "New Video" }
  let(:sender_name) { "Admin" }

  it "broadcasts the notification to another user" do
    expect(NotificationsChannel).to receive(:broadcast_to).with(
      recipient,
      { title: video_title, sender: sender_name }
    )

    described_class.perform_now(sender.id, video_title, sender_name)
  end

  it "does not broadcast the notification to the sender" do
    expect(NotificationsChannel).not_to receive(:broadcast_to).with(
      sender,
      anything
    )

    described_class.perform_now(sender.id, video_title, sender_name)
  end
end