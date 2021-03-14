class CreateHistoricalEmissionsSubCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :historical_emissions_sub_categories do |t|
      t.text :name, null: false
      t.timestamps
    end

    add_index :historical_emissions_sub_categories, [:name], unique: true

    add_reference :historical_emissions_records,
                  :sub_category,
                  foreign_key: {
                    to_table: :historical_emissions_sub_categories,
                    on_delete: :cascade
                  }
  end
end
