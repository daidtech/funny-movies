require 'devise'
require 'spec_helper'

ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../config/environment', __dir__)
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'

# Silence fixture_path= deprecation from rspec-rails 5.x on Rails 7.1+
# TODO: Remove this shim after upgrading to an rspec-rails version that uses
# fixture_paths= internally, then replace config.fixture_path with the newer API.
if ActiveRecord::TestFixtures::ClassMethods.method_defined?(:fixture_path=)
  module FixturePathShim
    def fixture_path=(path)
      if respond_to?(:fixture_paths=)
        self.fixture_paths = Array(path)
      else
        super
      end
    end
  end
  ActiveRecord::TestFixtures::ClassMethods.prepend(FixturePathShim)
end

# Add additional requires below this line.
require 'factory_bot_rails'
require 'database_cleaner/active_record'

Dir[Rails.root.join('spec/support/**/*.rb')].sort.each { |file| require file }

# Checks for pending migrations and applies them before tests are run.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  puts e.to_s.strip
  exit 1
end

RSpec.configure do |config|
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include RequestAuthHelpers, type: :request

  config.fixture_path = "#{::Rails.root}/spec/fixtures"
  config.render_views = true

  config.use_transactional_fixtures = true

  # Include FactoryBot methods
  config.include FactoryBot::Syntax::Methods

  # Clean database between tests
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # Enable focus-based tests
  config.filter_run_when_matching :focus

  # Infer spec types from file locations
  config.infer_spec_type_from_file_location!

  # Filter Rails backtrace
  config.filter_rails_from_backtrace!
end
