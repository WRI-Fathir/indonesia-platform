class CreatePolicyValues < ActiveRecord::Migration[5.2]
  def change
    create_table :policy_values do |t|
      t.references :location, foreign_key: { on_delete: :cascade }, index: true
      t.references :policy, foreign_key: { on_delete: :cascade }, index: true
      t.string :category
      t.string :source
      t.jsonb :values
      t.timestamps
    end
  end
end
