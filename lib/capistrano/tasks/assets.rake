# frozen_string_literal: true

namespace :assets do
  desc "preompile assets"
  task :precompile do
    on release_roles(fetch(:assets_roles)) do
      within release_path do
        with rails_env: fetch(:rails_env), rails_groups: fetch(:rails_assets_groups) do
          execute :rake, "assets:clean"
          execute :rake, "assets:clobber"
          execute :rake, "yarn:install"
          execute :rake, "assets:precompile"
        end
      end
    end
  end
end

namespace :load do
  task :defaults do
    set :assets_roles, fetch(:assets_roles, [:web])
  end
end
