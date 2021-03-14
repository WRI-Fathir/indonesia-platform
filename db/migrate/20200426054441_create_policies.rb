class CreatePolicies < ActiveRecord::Migration[5.2]
  def change
    create_table :policies do |t|
      t.string :section, null: false
      t.string :code, null: false
      t.string :name, null: false
      t.string :unit
      t.text :description
      t.jsonb :translations, default: {}
      t.timestamps
    end

    add_index :policies, :code, unique: true
    add_index :policies, :section
  end
end
