source 'https://rubygems.org'
ruby '2.5.1'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.2'
# Use postgresql as the database for Active Record
gem 'pg', '>= 0.18', '< 2.0'
# Use Puma as the app server
gem 'puma', '~> 3.7'
# Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
gem 'webpacker', '4.2.2'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# gem 'jbuilder', '~> 2.5'
gem 'active_model_serializers', '~> 0.10.0'
gem 'responders'
gem 'sidekiq'

# Add second shared database across country platforms
gem 'secondbase'
# Add activeadmin for simple CMS
gem 'activeadmin'
gem 'devise'
gem 'i18n-active_record', require: 'i18n/active_record'
# read .env environment variables
gem 'dotenv-rails'
# Add Rack CORS for setup cross origin HTTP
gem 'rack-cors'
# Coffee rails for activeadmin depedencies
gem 'coffee-rails', '~> 5.0.0'


# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'
# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'rspec-rails', '~> 3.5'
  gem 'rspec-collection_matchers'
  gem 'rails-controller-testing'
  gem 'factory_bot_rails'
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '~> 2.13'
  gem 'selenium-webdriver'
end

group :development do
  gem 'annotate'
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'rubocop', require: false
  # capistrano for deploying
  gem 'capistrano', '3.11.2'
  gem 'capistrano-bundler', '~> 1.6'
  gem 'capistrano-rails', '~> 1.4'
  gem 'capistrano-passenger', '~> 0.2.0'
  gem 'capistrano-rvm'
end

group :test do
  gem 'simplecov', require: false
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

git 'https://github.com/anggiaramadhan/climate-watch-gems', branch: 'develop' do
  gem 'climate_watch_engine', '~> 1.4.3'
  gem 'cw_locations', '~> 1.4.1', require: 'locations'
  gem 'cw_historical_emissions', '~> 1.5.1', require: 'historical_emissions'
  gem 'cw_data_uploader', '~> 0.4.0', require: 'data_uploader'
end

# for debugging
# gem 'climate_watch_engine', '~> 1.4.3', path: '../climate-watch-gems' #
# gem 'cw_locations', '~> 1.4.1', require: 'locations', path: '../climate-watch-gems' #
# gem 'cw_historical_emissions', '~> 1.5.1', require: 'historical_emissions', path: '../climate-watch-gems'
# gem 'cw_data_uploader', '~> 0.4.0', require: 'data_uploader', path: '../climate-watch-gems'
