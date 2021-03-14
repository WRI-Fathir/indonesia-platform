class CreateHistoricalEmissionsCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :historical_emissions_categories do |t|
      t.text :name, null: false
      t.timestamps
    end

    add_index :historical_emissions_categories, [:name], unique: true

    add_reference :historical_emissions_records,
                  :category,
                  foreign_key: {
                    to_table: :historical_emissions_categories,
                    on_delete: :cascade
                  }
  end
end
