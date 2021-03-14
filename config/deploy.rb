# config valid for current version and patch releases of Capistrano
# lock "~> 3.11.2"

set :application, "climate-watch-indonesia-platform"
set :repo_url, "https://github.com/wri/climate-watch-indonesia-platform.git"

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp
set :branch, :develop

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "/home/cwi/#{fetch :application}"
# set :deploy_to, "/home/deploy/#{fetch :application}"

# Default value for :linked_files is []
append :linked_files, "config/database.yml", ".env", "config/secrets.yml"

# Default value for linked_dirs is []
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system"

# Bundle install application
append :linked_dirs, '.bundle'

# Default value for keep_releases is 5
set :keep_releases, 2

set :rvm_ruby_version, 'ruby-2.5.1'
