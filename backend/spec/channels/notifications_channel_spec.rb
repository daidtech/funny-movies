require 'rails_helper'

RSpec.describe NotificationsChannel, type: :channel do
  let(:user) { create(:user) }

  before do
    stub_connection current_user: user
  end

  it "subscribes to a stream when channel is subscribed" do
    subscribe
    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_for(user)
  end

  it "unsubscribes from the stream when channel is unsubscribed" do
    subscribe
    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_for(user)

    subscription.unsubscribe_from_channel
    expect(subscription).not_to have_streams
  end
end