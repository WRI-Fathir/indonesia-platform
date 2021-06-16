class Province::ImportLocations
  include ClimateWatchEngine::CSVImporter

  # headers :pik_name, :cait_name, :wri_standard_name, :iso_code3, :iso_code2,
  #         :unfccc_group, :location_type, :show_in_cw
  headers :wri_standard_name, :iso_code3, :iso_code2, :location_type, :capital_city

  LOCATIONS_FILEPATH = "#{CW_FILES_PREFIX}province_locations/province_locations.csv"
  LOCATIONS_ID_FILEPATH = "#{CW_FILES_PREFIX}province_locations/province_locations_id.csv"
  LOCATIONS_CARTODB_URL = 'https://wri-01.carto.com/api/v2/sql?q=SELECT%20name_engli,iso,topojson,centroid%20FROM%20gadm28_countries'

  def call
    return unless valid_headers?(csv, LOCATIONS_FILEPATH, headers)

    ActiveRecord::Base.transaction do
      import_locations
      import_topojson
    end
  end

  private

  def csv
    @csv = S3CSVReader.read(LOCATIONS_FILEPATH)
  end

  def csv_id
    @csv_id ||= S3CSVReader.read(LOCATIONS_ID_FILEPATH)
  end

  def import_locations
    I18n.with_locale(:en) do
      import_each_with_logging(csv, LOCATIONS_FILEPATH) do |row|
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

  def import_topojson
    uri = URI(LOCATIONS_CARTODB_URL)
    response = Net::HTTP.get(uri)
    parsed_response = JSON.parse(response, symbolize_names: true)
    parsed_response[:rows].each do |row|
      centroid = row[:centroid].nil? ? {} : JSON.parse(row[:centroid])
      begin
        Location.
          where(iso_code3: row[:iso]).
          update(topojson: JSON.parse(row[:topojson]), centroid: centroid)
      rescue JSON::ParserError => e
        msg = "Error importing topojson data for #{row[:iso]}: #{e}"
        STDERR.puts msg
        add_error(
          :topojson,
          msg: msg
        )
      end
    end
  end

  def iso_code3(row)
    row[:iso_code3] && row[:iso_code3].upcase
  end

  def iso_code2(row)
    if row[:iso_code2].blank?
      ''
    else
      row[:iso_code2] && row[:iso_code2].upcase
    end
  end

  def show_in_cw(row)
    if row[:show_in_cw].blank?
      true
    else
      row[:show_in_cw].match?(/no/i) ? false : true
    end
  end

  def create_or_update(attributes)
    iso_code3 = attributes[:iso_code3]
    location = Location.find_or_initialize_by(iso_code3: iso_code3)
    location.update_attributes!(attributes)
  end
end
