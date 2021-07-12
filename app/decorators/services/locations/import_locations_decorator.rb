#filename: import_locations_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

Locations::ImportLocations.class_eval do
  headers :wri_standard_name, :iso_code3, :iso_code2, :location_type, :capital_city

  LOCATIONS_ID_FILEPATH = "#{CW_FILES_PREFIX}locations/locations_id.csv".freeze

  private

  def import_locations
    I18n.with_locale(:en) do
      import_each_with_logging(csv, Locations.locations_filepath) do |row|
        create_or_update(location_attributes(row))
      end
    end

    I18n.with_locale(:id) do
      import_each_with_logging(csv_id, LOCATIONS_ID_FILEPATH) do |row|
        create_or_update(location_attributes(row))
      end
    end
  end

  def location_attributes(row)
    {
      iso_code3: iso_code3(row),
      iso_code2: iso_code2(row),
      wri_standard_name: row[:wri_standard_name],
      location_type: row[:location_type] || 'COUNTRY',
      show_in_cw: show_in_cw(row),
      capital_city: row[:capital_city]
    }
  end

  def csv_id
    @csv_id ||= S3CSVReader.read(LOCATIONS_ID_FILEPATH)
  end
end
