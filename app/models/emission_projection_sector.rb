class EmissionProjectionSector < ApplicationRecord
  include Translate

  translates :name

  validates :name, presence: true, uniqueness: true

  has_many :models, class_name: 'EmissionProjectionModel'

  def code
    Code.create(read_attribute(:name))
  end
end
