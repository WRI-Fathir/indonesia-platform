ActiveAdmin.register AdminUser do
  menu priority: 2
  permit_params :email, :password, :password_confirmation, :role

  controller do
    before_action :check_admin_role, only: [:new, :read, :destroy]

    def check_admin_role
      !current_admin_user.superuser? &&
        redirect_to(admin_admin_users_path)
    end

    def update_resource(object, attributes)
      update_method =
        if attributes.first[:password].present?
          :update_attributes
        else
          :update_without_password
        end
      object.send(update_method, *attributes)
    end

    def update
      update! do |format|
        format.html { redirect_to edit_admin_admin_user_path(@admin_user) }
      end
    end
  end

  index do
    selectable_column
    id_column
    column :email
    column :role
    column :current_sign_in_at
    column :sign_in_count
    column :created_at
    actions
  end

  filter :email
  filter :current_sign_in_at
  filter :sign_in_count
  filter :created_at

  form do |f|
    f.inputs do
      f.input :email
      f.input :role, as: :select, collection: %w(superuser admin admin_province admin_national), include_blank: false if current_admin_user.superuser?
      f.input :password
      f.input :password_confirmation
    end
    f.actions
  end

end
