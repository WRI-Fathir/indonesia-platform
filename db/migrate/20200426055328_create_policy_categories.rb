class CreatePolicyCategories < ActiveRecord::Migration[5.2]
  def up
    create_table :policy_categories do |t|
      t.text :name, null: false
      t.jsonb :translations, default: {}
      t.timestamps
    end
    add_index :policy_categories, :name, unique: true

    remove_column :policy_values, :category
    add_reference :policy_values,
                  :category,
                  foreign_key: { to_table: :policy_categories, on_delete: :cascade }
  end

  def down
    remove_reference :policy_values, :category
    add_column :policy_values, :category, :string
    drop_table :policy_categories
  end
end
