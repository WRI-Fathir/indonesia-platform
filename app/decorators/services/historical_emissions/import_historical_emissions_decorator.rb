HistoricalEmissions::ImportHistoricalEmissions.class_eval do
  headers metadata: [:source, :sector, :subsectorof, :category, :category_of, :sub_category, :sub_category_of],
          records: [:geoid, :source, :metric, :sector, :category, :sub_category, :gas, :gas_unit]

  def call
    return unless all_headers_valid?

    ActiveRecord::Base.transaction do
      cleanup
      import_sectors(meta_sectors_csv, HistoricalEmissions.meta_sectors_filepath)
      import_categories(meta_sectors_csv, HistoricalEmissions.meta_sectors_filepath)
      import_sub_categories(meta_sectors_csv, HistoricalEmissions.meta_sectors_filepath)
      import_records(data_cait_csv, HistoricalEmissions.data_cait_filepath)
    end
  end

  def all_headers_valid?
    [
      valid_headers?(
        meta_sectors_csv, HistoricalEmissions.meta_sectors_filepath, headers[:metadata]
      ),
      valid_headers?(data_cait_csv, HistoricalEmissions.data_cait_filepath, headers[:records])
    ].all?(true)
  end

  def record_attributes(row)
    {
      location: Location.find_by(iso_code3: row[:geoid]),
      data_source: HistoricalEmissions::DataSource.find_by(name: row[:source]),
      sector: HistoricalEmissions::Sector.find_by(name: row[:sector]),
      gas: HistoricalEmissions::Gas.find_or_create_by(name: row[:gas], unit: row[:gas_unit]),
      gwp: HistoricalEmissions::Gwp.find_or_create_by(name: 'AR2'),
      metric: HistoricalEmissions::Metric.find_or_create_by(name: row[:metric]),
      category: HistoricalEmissions::Category.find_or_create_by(name: row[:category]),
      sub_category: HistoricalEmissions::SubCategory.find_or_create_by(name: row[:sub_category]),
      emissions: emissions(row)
    }
  end

  def category_attributes(row)
    {
      name: row[:category],
      sector: row[:category_of] &&
        HistoricalEmissions::Sector.find_or_create_by(name: row[:category_of])
    }
  end

  def sub_category_attributes(row)
    {
      name: row[:sub_category],
      category: row[:sub_category_of] &&
        HistoricalEmissions::Category.find_or_create_by(name: row[:sub_category_of])
    }
  end

  def import_sectors(content, filepath)
    import_each_with_logging(content, filepath) do |row|
      next if HistoricalEmissions::Sector.find_by(name: row[:sector])

      sector = sector_attributes(row)
      HistoricalEmissions::Sector.create!(sector)
    end
  end

  def import_categories(content, filepath)
    import_each_with_logging(content, filepath) do |row|
      next if HistoricalEmissions::Category.find_by(name: row[:category])

      category = category_attributes(row)
      HistoricalEmissions::Category.create!(category)
    end
  end

  def import_sub_categories(content, filepath)
    import_each_with_logging(content, filepath) do |row|
      next if HistoricalEmissions::SubCategory.find_by(name: row[:sub_category])

      sub_category = sub_category_attributes(row)
      HistoricalEmissions::SubCategory.create!(sub_category)
    end
  end

  def cleanup
    HistoricalEmissions::Record.delete_all
    HistoricalEmissions::SubCategory.delete_all
    HistoricalEmissions::Category.delete_all
    HistoricalEmissions::Sector.delete_all
    HistoricalEmissions::DataSource.delete_all
    HistoricalEmissions::Gas.delete_all
  end
end
