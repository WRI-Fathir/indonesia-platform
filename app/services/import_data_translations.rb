#filename: import_data_translations.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportDataTranslations
  include ClimateWatchEngine::CSVImporter

  headers :domain, :name_en, :name_id

  DATA_FILEPATH = "#{CW_FILES_PREFIX}data_translations/translations.csv".freeze

  def call
    return unless valid_headers?(csv, DATA_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      import_data
    end
  end

  private

  def cleanup
    Translation.data_translations.delete_all
  end

  def import_data
    import_each_with_logging(csv, DATA_FILEPATH) do |row|
      domain = row[:domain]
      code = Code.create(row[:name_en])
      key = "#{Translation::DATA_PREFIX}.#{domain}.#{code}"
      Translation.find_or_create_by!(
        locale: :en,
        key: key,
        value: row[:name_en]
      )
      Translation.find_or_create_by!(
        locale: :id,
        key: key,
        value: row[:name_id]
      )
    end
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end
end
