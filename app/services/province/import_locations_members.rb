#filename: import_locations_members.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class Province::ImportLocationsMembers
  include ClimateWatchEngine::CSVImporter

  headers :iso_code3, :parent_iso_code3

  LOCATIONS_GROUPINGS_FILEPATH = "#{CW_FILES_PREFIX}province_locations_members/province_locations_groupings.csv"

  def call
    return unless valid_headers?(csv, LOCATIONS_GROUPINGS_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      import_records
    end
  end

  private

  def csv
    @csv ||= S3CSVReader.read(LOCATIONS_GROUPINGS_FILEPATH)
  end

  def import_records
    import_each_with_logging(csv, LOCATIONS_GROUPINGS_FILEPATH) do |row|
      LocationMember.find_or_create_by!(
        location: Location.find_by_iso_code3(row[:iso_code3]&.upcase),
        member: Location.find_by_iso_code3(row[:parent_iso_code3]&.upcase)
      )
    end
  end
end
