class CreateEmissionActivityCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :emission_activity_categories do |t|
      t.text :name, null: false
      t.jsonb :translations, default: {}
      t.timestamps
    end
    add_index :emission_activity_categories, :name, unique: true
    add_reference :emission_activity_sectors,
                  :category,
                  foreign_key: { to_table: :emission_activity_categories, on_delete: :cascade }
  end
end
