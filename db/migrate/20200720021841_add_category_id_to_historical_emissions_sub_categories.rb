class AddCategoryIdToHistoricalEmissionsSubCategories < ActiveRecord::Migration[5.2]
  def change
    add_reference :historical_emissions_sub_categories, :category, foreign_key: { to_table: :historical_emissions_categories }
  end
end
