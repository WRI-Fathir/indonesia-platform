#filename: import_province_plans.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportProvincePlans
  include ClimateWatchEngine::CSVImporter

  headers dev_plans: [:geoid, :source, :rpjmd_period, :supportive_mission_statement_in_rpjmd],
          climate_plans: [:geoid, :source, :sector, :subsector, :mitigation_activities]

  DEV_PLANS_FILEPATH = "#{CW_FILES_PREFIX}province_plans/development_plans.csv".freeze
  DEV_PLANS_ID_FILEPATH = "#{CW_FILES_PREFIX}province_plans/development_plans_id.csv".freeze
  CLIMATE_PLANS_FILEPATH = "#{CW_FILES_PREFIX}province_plans/climate_plans.csv".freeze
  CLIMATE_PLANS_ID_FILEPATH = "#{CW_FILES_PREFIX}province_plans/climate_plans_id.csv".freeze

  DEV_PLAN_SECTOR_PREFIX = 'Supportive Policy Direction in RPJMD:'.freeze

  def call
    return unless all_headers_valid?

    ActiveRecord::Base.transaction do
      cleanup

      import_climate_plans(climate_plans_csv, CLIMATE_PLANS_FILEPATH, locale: :en)
      import_climate_plans(climate_plans_id_csv, CLIMATE_PLANS_ID_FILEPATH, locale: :id)
      import_dev_plans(dev_plans_csv, DEV_PLANS_FILEPATH, locale: :en)
      import_dev_plans(dev_plans_id_csv, DEV_PLANS_ID_FILEPATH, locale: :id)
    end
  end

  private

  def all_headers_valid?
    [
      valid_headers?(climate_plans_csv, CLIMATE_PLANS_FILEPATH, headers[:climate_plans]),
      valid_headers?(climate_plans_id_csv, CLIMATE_PLANS_ID_FILEPATH, headers[:climate_plans]),
      valid_headers?(dev_plans_csv, DEV_PLANS_FILEPATH, headers[:dev_plans]),
      valid_headers?(dev_plans_id_csv, DEV_PLANS_ID_FILEPATH, headers[:dev_plans])
    ].all?(true)
  end

  def cleanup
    Province::DevelopmentPlan.delete_all
    Province::ClimatePlan.delete_all
  end

  def climate_plans_csv
    @climate_plans_csv ||= S3CSVReader.read(CLIMATE_PLANS_FILEPATH)
  end

  def climate_plans_id_csv
    @climate_plans_id_csv ||= S3CSVReader.read(CLIMATE_PLANS_ID_FILEPATH)
  end

  def dev_plans_csv
    @dev_plans_csv ||= S3CSVReader.read(
      DEV_PLANS_FILEPATH,
      header_converters: dev_plan_header_converter
    )
  end

  def dev_plans_id_csv
    @dev_plans_id_csv ||= S3CSVReader.read(
      DEV_PLANS_ID_FILEPATH,
      header_converters: dev_plan_header_converter
    )
  end

  def import_climate_plans(csv, filepath, locale: I18n.default_locale)
    import_each_with_logging(csv, filepath) do |row|
      Province::ClimatePlan.create!(climate_plan_attributes(row).merge(locale: locale))
    end
  end

  def import_dev_plans(csv, filepath, locale: I18n.default_locale)
    import_each_with_logging(csv, filepath) do |row|
      Province::DevelopmentPlan.create!(dev_plan_attributes(row).merge(locale: locale))
    end
  end

  def climate_plan_attributes(row)
    {
      location: Location.find_by(iso_code3: row[:geoid]),
      source: row[:source],
      sector: row[:sector],
      sub_sector: row[:subsector],
      mitigation_activities: row[:mitigation_activities]&.delete('_x005F_x005F_x000D_')
    }
  end

  def dev_plan_attributes(row)
    {
      location: Location.find_by(iso_code3: row[:geoid]),
      source: row[:source],
      rpjmd_period: row[:rpjmd_period],
      supportive_mission_statement: row[:supportive_mission_statement_in_rpjmd],
      supportive_policy_directions: supportive_policy_directions(row)
    }
  end

  def dev_plan_header_converter
    lambda do |h|
      return h if h.downcase.start_with?(DEV_PLAN_SECTOR_PREFIX.downcase)

      CSV::HeaderConverters[:symbol].call(h)
    end
  end

  def supportive_policy_directions(row)
    prefix_regex = /#{DEV_PLAN_SECTOR_PREFIX}/i
    row.headers.grep(prefix_regex).map do |column|
      {sector: column.gsub(prefix_regex, '').strip, value: row[column]}
    end
  end
end
