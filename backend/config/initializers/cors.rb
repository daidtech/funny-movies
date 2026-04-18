default_cors_origins = if Rails.env.development?
  [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ]
else
  []
end

allowed_cors_origins = ENV.fetch('CORS_ORIGINS', default_cors_origins.join(','))
  .split(',')
  .map(&:strip)
  .reject(&:empty?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_cors_origins)

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization']
  end
end
