# frozen_string_literal: true

namespace :webpacker do
    desc "Compile webpacker assets"
    task :compile do
      on release_roles(fetch(:assets_roles)) do
        within release_path do
          with rails_env: fetch(:rails_env), rails_groups: fetch(:rails_assets_groups) do
            execute :rake, "yarn:install"
            execute :rake, "webpacker:compile"
          end
        end
      end
    end
  
    desc "Clobber webpacker assets"
    task :clobber do
      on release_roles(fetch(:assets_roles)) do
        within release_path do
          with rails_env: fetch(:rails_env), rails_groups: fetch(:rails_assets_groups) do
            execute :rake, "webpacker:clobber"
          end
        end
      end
    end
  
    desc "Check node installed"
    task :check do
      on release_roles(fetch(:assets_roles)) do
        required_node_version = "6.4"
        begin
          node_version = capture(:node, "-v")
        rescue SSHKit::Command::Failed
          error "Node.js not installed. Please download and install Node.js https://nodejs.org/en/download/"
          exit 1
        end
        if Gem::Version.new(node_version.strip.tr("v", "")) < Gem::Version.new(required_node_version)
          error <<-ERROR.strip_heredoc
              Webpacker requires Node.js >= v#{required_node_version} and you are using #{node_version}"
              Please upgrade Node.js https://nodejs.org/en/download/
          ERROR
          exit 1
        end
  
        info "Node.js installed."
      end
    end
  
    # after "deploy:check", "webpacker:check"
    # after "deploy:updated", "webpacker:compile"
  end
  
  namespace :load do
    task :defaults do
      set :assets_roles, fetch(:assets_roles, [:web])
    end
  end