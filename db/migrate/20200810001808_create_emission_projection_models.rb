class CreateEmissionProjectionModels < ActiveRecord::Migration[5.2]
  def change
    create_table :emission_projection_models do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.timestamps
    end

    add_index :emission_projection_models, :code, unique: true
  end
end
