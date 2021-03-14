HistoricalEmissions::RecordSerializer.class_eval do
  belongs_to :metric
  belongs_to :category
  attribute :subCategory

  def metric
    object.metric.code
  end

  def category
    object.category.code
  end

  def subCategory
    object.sub_category.code
  end

  def sector
    object.sector.code
  end

  def gas
    object.gas.code
  end
end
