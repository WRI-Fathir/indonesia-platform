#filename: import_emission_targets.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportEmissionTargets
  include ClimateWatchEngine::CSVImporter

  headers :geoid, :source, :label, :sector, :value, :unit, :range, :year

  DATA_FILEPATH = "#{CW_FILES_PREFIX}emission_targets/emission_targets.csv".freeze

  def call
    return unless valid_headers?(csv, DATA_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      cleanup
      import_data
    end
  end

  private

  def cleanup
    EmissionTarget::Value.delete_all
    EmissionTarget::Label.delete_all
    EmissionTarget::Sector.delete_all
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end

  # rubocop:disable MethodLength, AbcSize
  def import_data
    import_each_with_logging(csv, DATA_FILEPATH) do |row|
      next unless row[:value].present?

      location = Location.find_by(iso_code3: row[:geoid])
      label = EmissionTarget::Label.find_or_create_by!(name: row[:label])
      sector = EmissionTarget::Sector.find_or_create_by!(name: row[:sector])
      row_value = row[:value].delete(',').to_f

      if row[:range] == 'Yes'
        value = EmissionTarget::Value.find_or_initialize_by(
          source: row[:source],
          location: location,
          label: label,
          sector: sector,
          year: row[:year],
          first_value: nil,
          unit: row[:unit]
        )

        range = [value.second_value, row_value].compact.sort
        range.unshift(nil) if range.size == 1
        value.update!(first_value: range.first, second_value: range.second)
      else
        EmissionTarget::Value.create!(
          source: row[:source],
          location: location,
          label: label,
          sector: sector,
          year: row[:year],
          first_value: row_value,
          unit: row[:unit]
        )
      end
    end
  end
  # rubocop:enable MethodLength, AbcSize
end
