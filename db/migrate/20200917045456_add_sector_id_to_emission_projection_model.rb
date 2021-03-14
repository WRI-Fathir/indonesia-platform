class AddSectorIdToEmissionProjectionModel < ActiveRecord::Migration[5.2]
  def change
    add_reference :emission_projection_models, :sector, foreign_key: { to_table: :emission_projection_sectors}
  end
end
