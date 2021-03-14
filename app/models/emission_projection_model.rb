class EmissionProjectionModel < ApplicationRecord
  validates_presence_of :name, :code
  validates :code, uniqueness: true

  belongs_to :sector, class_name: 'EmissionProjectionSector',
                      foreign_key: 'sector_id',
                      required: false
end
