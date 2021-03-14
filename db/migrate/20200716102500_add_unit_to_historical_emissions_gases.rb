class AddUnitToHistoricalEmissionsGases < ActiveRecord::Migration[5.2]
  def change
    add_column :historical_emissions_gases, :unit, :text
  end
end
