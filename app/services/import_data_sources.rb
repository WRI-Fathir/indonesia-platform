#filename: import_data_sources.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportDataSources
  include ClimateWatchEngine::CSVImporter

  headers :short_title, :title, :source_organization, :learn_more_link,
          :summary, :description, :citation, :caution

  DATA_FILEPATH = "#{CW_FILES_PREFIX}metadata/data_sources.csv".freeze
  DATA_ID_FILEPATH = "#{CW_FILES_PREFIX}metadata/data_sources_id.csv".freeze

  def call
    return unless all_headers_valid?

    ActiveRecord::Base.transaction do
      cleanup
      import_data(csv, DATA_FILEPATH, locale: :en)
      import_data(csv_id, DATA_ID_FILEPATH, locale: :id)
    end
  end

  private

  def all_headers_valid?
    [
      valid_headers?(csv, DATA_FILEPATH, headers),
      valid_headers?(csv_id, DATA_ID_FILEPATH, headers)
    ].all?(true)
  end

  def cleanup
    DataSource.delete_all
  end

  def import_data(csv, filepath, locale:)
    I18n.with_locale(locale) do
      import_each_with_logging(csv, filepath) do |row|
        data_source = DataSource.find_or_initialize_by(short_title: row[:short_title])
        data_source.update_attributes!(
          title: row[:title],
          source_organization: row[:source_organization],
          learn_more_link: row[:learn_more_link],
          summary: row[:summary],
          description: row[:description],
          citation: row[:citation],
          caution: row[:caution]
        )
      end
    end
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end

  def csv_id
    @csv_id ||= S3CSVReader.read(DATA_ID_FILEPATH)
  end
end
