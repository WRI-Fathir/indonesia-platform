HistoricalEmissions::Record.class_eval do
  belongs_to :metric, class_name: 'HistoricalEmissions::Metric'
  belongs_to :category, class_name: 'HistoricalEmissions::Category'
  belongs_to :sub_category, class_name: 'HistoricalEmissions::SubCategory'

  def self.find_by_params(params)
      records = ::HistoricalEmissions::Record.
        includes(
          :location,
          :data_source,
          :sector,
          :gas,
          :gwp,
          :category,
          :sub_category
        )

      filters(records, params)
  end


  def self.filters(records, params)
    unless params[:location].blank?
      records = records.where(
        locations: {iso_code3: params[:location].split(',')}
      )
    end

    {
      historical_emissions_gases: :gas,
      historical_emissions_data_sources: :source,
      historical_emissions_sectors: :sector,
      historical_emissions_categories: :category,
      historical_emissions_sub_categories: :sub_category
    }.each do |k, v|
      records = records.where(k => {id: params[v].split(',')}) if params[v]
    end

    records = records.where(gwp_id: params[:gwp]) if params[:gwp]

    records
  end
end