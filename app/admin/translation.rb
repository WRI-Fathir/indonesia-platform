ActiveAdmin.register_page 'Translations' do
  menu priority: 5
  content title: 'Translations' do
    para 'This page consists of website texts that could be changed dynamically for all supported languages.'

    para 'Page names are capitalized to easily find out which texts belong to the page.'

    para 'The base language is English and if any text is not yet translated then we use the base translation.'

    table_for TranslationEntry.find_by(params), class: 'table index_table' do
      column :identifier
      column 'English text', :en_value
      column 'Indonesian text', :id_value
      column 'Actions' do |translation|
        link_to 'Edit', admin_translations_edit_path(key: translation.key)
      end
    end
  end

  sidebar :filter, only: :index, partial: 'filter'

  page_action :edit, method: :get do
    entry = TranslationEntry.all.find { |te| te.key.to_s == params[:key].to_s }

    return redirect_to admin_translations_path unless entry.present?

    render 'edit', locals: {entry: entry}, layout: 'active_admin'
  end

  page_action :update, method: :post do
    if TranslationEntry.new(entry_params).save
      flash[:notice] = 'Translations saved!'
      redirect_to admin_translations_path
    else
      render 'edit'
    end
  end

  controller do
    def entry_params
      params.require(:entry).permit(:key, :en_value, :id_value)
    end
  end
end
