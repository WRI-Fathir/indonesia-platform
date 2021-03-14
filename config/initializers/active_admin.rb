ActiveAdmin.setup do |config|
  config.site_title = 'Climate Watch Indonesia'
  config.authentication_method = :authenticate_admin_user!
  # config.authorization_adapter = "OnlyPages"

  config.current_user_method = :current_admin_user

  config.logout_link_path = :destroy_admin_user_session_path
  config.comments = false

  config.batch_actions = true

  config.localize_format = :long

  config.namespace :admin do |admin|
    admin.build_menu do |menu|
      menu.add label: 'Indonesia Platform', if: proc{ %w[superuser admin admin_national].include?(current_admin_user.role) }, priority: 3
      menu.add label: 'Province Platform', if: proc{ %w[superuser admin admin_province].include?(current_admin_user.role) }, priority: 4
    end
  end
end
