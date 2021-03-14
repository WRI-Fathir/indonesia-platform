class EmissionProjectionScenario < ApplicationRecord
  include Translate

  translates :name

  validates :name, presence: true, uniqueness: true

  def code
    Code.create(read_attribute(:name))
  end
end
