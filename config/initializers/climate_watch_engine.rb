ClimateWatchEngine.s3_bucket_name = Rails.application.secrets.s3_bucket_name

# Locations engine initializer
require 'locations'
Locations.locations_filepath = "#{CW_FILES_PREFIX}locations/locations.csv"
Locations.cartodb_url =
  'https://wri-01.carto.com/api/v2/sql?q=SELECT%20name_engli,iso,topojson,centroid%20FROM%20gadm28_countries'
Locations.location_groupings_filepath = "#{CW_FILES_PREFIX}locations_members/locations_groupings.csv"

# HistoricalEmissions engine initializer
require 'historical_emissions'
HistoricalEmissions.meta_sectors_filepath = "#{CW_FILES_PREFIX}historical_emissions/historical_emissions_metadata_sectors.csv"
HistoricalEmissions.data_cait_filepath = "#{CW_FILES_PREFIX}historical_emissions/historical_emissions_data.csv"
