class AddSectorIdToHistoricalEmissionsCategories < ActiveRecord::Migration[5.2]
  def change
    add_reference :historical_emissions_categories, :sector, foreign_key: { to_table: :historical_emissions_sectors }
  end
end
