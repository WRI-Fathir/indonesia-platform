#filename: historical_emissions_controller_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

HistoricalEmissions::HistoricalEmissionsController.class_eval do
  include Localizable

  before_action :include_sub_locations, only: [:index]

  HistoricalEmissionsMetadata = Struct.new(
    :data_sources,
    :sectors,
    :metrics,
    :gases,
    :gwps,
    :categories,
    :sub_categories,
    :locations
  ) do
    alias_method :read_attribute_for_serialization, :send

    def self.model_name
      'metadata'
    end
  end

  def download
    data_sources = DataSource.where(short_title: sources)
    filter = HistoricalEmissions::Filter.new({})
    emissions_csv_content = HistoricalEmissions::CsvContent.new(filter).call
    targets = EmissionTarget::Value.includes(:location, :label, :sector)
    targets = targets.where(locations: {iso_code3: locations}) if locations

    targets_csv = Api::V1::EmissionTarget::ValueCSVSerializer.new(targets).to_csv

    render zip: {
      'historical_emissions.csv' => emissions_csv_content,
      'emission_targets.csv' => targets_csv,
      'data_sources.csv' => data_sources.to_csv
    }
  end

  def meta
    if inventory?
      render(
        json: HistoricalEmissionsMetadata.new(
          fetch_meta_data_sources,
          fetch_meta_sectors,
          ::HistoricalEmissions::Metric.all,
          ::HistoricalEmissions::Gas.all,
          ::HistoricalEmissions::Gwp.all,
          fetch_meta_categories,
          fetch_meta_sub_categories,
          fetch_locations
        ),
        serializer: ::HistoricalEmissions::MetadataSerializer
      )
    else
      render(
        json: HistoricalEmissionsMetadata.new(
          fetch_meta_data_sources,
          fetch_meta_sectors,
          ::HistoricalEmissions::Metric.all,
          ::HistoricalEmissions::Gas.all,
          ::HistoricalEmissions::Gwp.all,
          ::HistoricalEmissions::Category.all,
          ::HistoricalEmissions::SubCategory.all,
          fetch_locations
        ),
        serializer: ::HistoricalEmissions::MetadataSerializer
      )
    end
  end

  def data_sources_hash
    @data_sources_hash ||= ::HistoricalEmissions::Record.
      select(
        <<-SQL
          data_source_id,
          ARRAY_AGG(DISTINCT sector_id) AS sector_ids,
          ARRAY_AGG(DISTINCT gas_id) AS gas_ids,
          ARRAY_AGG(DISTINCT location_id) AS location_ids,
          ARRAY_AGG(DISTINCT category_id) AS category_ids,
          ARRAY_AGG(DISTINCT sub_category_id) AS sub_category_ids
        SQL
      ).
      group('data_source_id').
      as_json.
      map {|h| [h['data_source_id'], h.symbolize_keys.except(:id)]}.
      to_h
  end

  private

  def sources
    params[:source]&.split(',')
  end

  def locations
    params[:location]&.split(',')
  end

  def sectors
    params[:sector]&.split(',') || HistoricalEmissions::Sector.take(1).pluck(:id)
  end

  def categories
    params[:category]&.split(',') ||
    HistoricalEmissions::Category.includes(:sector)
      .where(sector: sectors).pluck(:id)
  end

  def sub_categories
    params[:sub_category]&.split(',')
  end

  def inventory?
    params[:inventory]
  end

  def include_sub_locations
    return unless params[:location].present?

    locations = params[:location].split(',')
    sub_locations = LocationMember.
      joins(:member, :location).
      where(locations: {iso_code3: locations}).
      pluck('locations_location_members.iso_code3')

    params[:location] = (locations + sub_locations).join(',')
  end

  def fetch_meta_categories
    base_query = ::HistoricalEmissions::Category
    base_query.where(sector_id: sectors).or(base_query.where(name: 'TOTAL'))
  end

  def fetch_meta_sub_categories
    base_query = ::HistoricalEmissions::SubCategory
    base_query.where(category_id: categories).or(base_query.where(name: 'TOTAL'))
  end

  def fetch_locations
    Location.where(location_type: 'PROVINCE')
  end
end
