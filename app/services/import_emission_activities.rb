class ImportEmissionActivities
  include ClimateWatchEngine::CSVImporter

  headers :source, :geoid, :sector, :subsector

  DATA_FILEPATH = "#{CW_FILES_PREFIX}emission_activities/emission_activities.csv".freeze

  def call
    return unless valid_headers?(csv, DATA_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      cleanup
      import_data
    end
  end

  private

  def cleanup
    EmissionActivity::Value.delete_all
    EmissionActivity::Sector.delete_all
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end

  def import_data
    import_each_with_logging(csv, DATA_FILEPATH) do |row|
      EmissionActivity::Value.create!(
        location: Location.find_by(iso_code3: row[:geoid]),
        sector: EmissionActivity::Sector.find_or_create_by!(sector_attributes(row)),
        source: row[:source],
        emissions: emissions(row)
      )
    end
  end

  def sector_attributes(row)
    {
      name: row[:subsector],
      parent: EmissionActivity::Sector.find_or_create_by!(name: row[:sector])
    }
  end

  def emissions(row)
    row.headers.grep(/\d{4}/).map do |year|
      {year: year.to_s.to_i, value: row[year]&.delete(',')&.to_f}
    end
  end
end
