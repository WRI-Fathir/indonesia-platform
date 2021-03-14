class AddDescriptionToPolicyValues < ActiveRecord::Migration[5.2]
  def change
    add_column :policy_values, :description, :text
  end
end
