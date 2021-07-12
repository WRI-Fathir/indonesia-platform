#filename: metadata_serializer_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

HistoricalEmissions::MetadataSerializer.class_eval do
  attribute :data_source
  attribute :metric
  attribute :category
  attribute :subCategory

  def data_source
    object.data_sources.map do |g|
      g.
        slice(:id, :name, :location_ids, :sector_ids, :gas_ids, :category_ids, :sub_category_ids).
        merge(source: "ghg_emission_inventory_#{g[:name]}")
    end
  end

  def sector
    object.sectors.map do |s|
      s.slice(:id, :name, :code)
    end
  end

  def metric
    object.metrics.map do |m|
      m.slice(:id, :name, :code)
    end
  end

  def category
    object.categories.map do |m|
      m.slice(:id, :name, :code, :sector_id)
    end
  end

  def subCategory
    object.sub_categories.map do |m|
      m.slice(:id, :name, :code, :category_id)
    end
  end

  def gas
    object.gases.map do |m|
      m.slice(:id, :name, :unit, :code)
    end
  end
end
