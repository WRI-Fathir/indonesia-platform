class CreateEmissionProjectionValues < ActiveRecord::Migration[5.2]
  def change
    create_table :emission_projection_values do |t|
      t.references :location, foreign_key: { on_delete: :cascade }, index: true
      t.references :model, foreign_key: { to_table: :emission_projection_models, on_delete: :cascade }, index: true
      t.references :scenario, foreign_key: { to_table: :emission_projection_scenarios, on_delete: :cascade }, index: true
      t.references :sector, foreign_key: { to_table: :emission_projection_sectors, on_delete: :cascade }, index: true
      t.string :source
      t.string :developed_by
      t.jsonb :values
      t.timestamps
    end
  end
end
