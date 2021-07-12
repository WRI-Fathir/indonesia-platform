#filename: import_funding_opportunities.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportFundingOpportunities
  include ClimateWatchEngine::CSVImporter

  headers :source, :project_name, :mode_of_support, :sectors_and_topics,
          :application_procedure, :website_link, :last_update_web

  DATA_FILEPATH = "#{CW_FILES_PREFIX}funding/opportunities.csv".freeze
  DATA_ID_FILEPATH = "#{CW_FILES_PREFIX}funding/opportunities_id.csv".freeze

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
    Funding::Opportunity.delete_all
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end

  def csv_id
    @csv_id ||= S3CSVReader.read(DATA_ID_FILEPATH)
  end

  def import_data(csv, filepath, locale: I18n.default_locale)
    import_each_with_logging(csv, filepath) do |row|
      Funding::Opportunity.create!(opportunity_attributes(row).merge(locale: locale))
    end
  end

  def opportunity_attributes(row)
    {
      source: row[:source],
      project_name: row[:project_name],
      mode_of_support: row[:mode_of_support],
      sectors_and_topics: row[:sectors_and_topics],
      description: row[:description],
      application_procedure: row[:application_procedure],
      website_link: row[:website_link],
      last_update_year: row[:last_update_web]
    }
  end
end
