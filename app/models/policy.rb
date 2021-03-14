class Policy < ApplicationRecord
  include Translate

  translates :name

  validates_presence_of :name, :code, :section, :unit
  validates :code, uniqueness: true
end
