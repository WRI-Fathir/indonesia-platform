ActiveAdmin.register_page 'Technical Supports' do
  menu if: proc { %w[superuser].include?(current_admin_user.role)}
  content title: 'Technical Support' do
    para 'This page consists of list of file has uploaded to S3 Bucket'

    table_for FileManager.find_by(params), class: 'table index_table' do
      column 'Filename', :filename
      column 'Folder', :key
      column 'Last Modified', :last_modified
    end

  end

  sidebar :filter, only: :index, partial: 'filter'

  sidebar :truncate, partial: 'truncate'

  page_action :delete, method: :delete do
    database_name = params[:database_name].parameterize.underscore.downcase.pluralize

    ActiveStorage::Attachment.all.each(&:purge) if database_name == 'active_storages'

    return redirect_to admin_technical_supports_path, notice: "Truncate #{params[:database_name]} success!"
  end
end
