class CreateEmissionProjectionSectors < ActiveRecord::Migration[5.2]
  def change
    create_table :emission_projection_sectors do |t|
      t.string :name, null: false
      t.jsonb :translations, default: {}
      t.timestamps
    end

    add_index :emission_projection_sectors, :name, unique: true
  end
end
