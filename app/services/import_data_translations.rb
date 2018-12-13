class ImportDataSources
  include ClimateWatchEngine::CSVImporter

  UnknownDomain = Class.new(StandardError)

  headers :domain, :name_en, :name_id

  DATA_FILEPATH = "#{CW_FILES_PREFIX}data_translations/translations.csv".freeze

  def call
    return unless valid_headers?(csv, DATA_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      import_data
    end
  end

  private

  def import_data
    import_each_with_logging(csv, filepath) do |row|
      domain = row[:domain]
      case domain
      when 'value_category'
        update_categories_translations(row)
      when 'sector'
        update_sector_translations(row)
      when 'metric'
        update_metric_translations(row)
      else
        raise UnknownDomain, "cannot recognize domain: #{domain}"
      end
    end
  end

  def update_categories_translations
    value =
  end

  def update_sector_translations(row)
    name_en = row[:name_en]
    name_id = row[:name_id]
    he_sector = HistoricalEmissions::Sector.find_by(name: name_en)
    I18n.with_locale(locale: :id) do
      he_sector.update_attributes(name: name_id)
    end

    ea_sector = EmissionActivity::Sector.find_by(name: name_en)
    I18n.with_locale(locale: :id) do
      ea_sector.update_attributes(name: name_id)
    end
  end

  def update_metric_translations(row)
    metric = HistoricalEmissions::Metric.find_by(name: row[:name_en])
    I18n.with_locale(locale: :id) do
      metric.update_attributes(name: row[:name_id])
    end
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end
end
