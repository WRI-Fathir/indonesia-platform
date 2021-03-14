class RemoveIndexHistoricalEmissionsCategories < ActiveRecord::Migration[5.2]
  def change
    remove_index :historical_emissions_categories, [:name]
    add_index :historical_emissions_categories, [:name]
  end
end
