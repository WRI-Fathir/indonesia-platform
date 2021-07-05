class RemoveUnitFromHistoricalEmissionsMetrics < ActiveRecord::Migration[5.2]
  def change
    remove_column :historical_emissions_metrics, :unit
  end
end
