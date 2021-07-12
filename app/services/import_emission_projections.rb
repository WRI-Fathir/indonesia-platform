#filename: import_emission_projections.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportEmissionProjections
  include ClimateWatchEngine::CSVImporter

  headers :source, :geoid, :sector, :developed_by, :model, :scenario

  DATA_FILEPATH = "#{CW_FILES_PREFIX}emission_projections/emission_projections.csv".freeze

  def call
    return unless valid_headers?(csv, DATA_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      cleanup
      import_data
    end
  end

  private

  def cleanup
    EmissionProjectionValue.delete_all
    EmissionProjectionSector.delete_all
    EmissionProjectionModel.delete_all
    EmissionProjectionScenario.delete_all
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end

  def import_data
    import_each_with_logging(csv, DATA_FILEPATH) do |row|
      EmissionProjectionValue.create!(
        location: Location.find_by(iso_code3: row[:geoid]),
        sector: EmissionProjectionSector.find_or_create_by!(sector_attributes(row)),
        model: EmissionProjectionModel.find_or_create_by!(model_attributes(row)),
        scenario: EmissionProjectionScenario.find_or_create_by!(scenario_attributes(row)),
        source: row[:source],
        developed_by: row[:developed_by],
        values: values(row)
      )
    end
  end

  def sector_attributes(row)
    {
      name: row[:sector]
    }
  end

  def model_attributes(row)
    {
      name: row[:model],
      code: row[:model]
    }
  end

  def scenario_attributes(row)
    {
      name: row[:scenario]
    }
  end

  def values(row)
    row.headers.grep(/\d{4}/).map do |year|
      {year: year.to_s.to_i, value: row[year]&.delete(',')&.to_f}
    end
  end
end
