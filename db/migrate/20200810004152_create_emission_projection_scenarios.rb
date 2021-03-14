class CreateEmissionProjectionScenarios < ActiveRecord::Migration[5.2]
  def change
    create_table :emission_projection_scenarios do |t|
      t.string :name, null: false
      t.jsonb :translations, default: {}
      t.timestamps
    end

    add_index :emission_projection_scenarios, :name, unique: true
  end
end
