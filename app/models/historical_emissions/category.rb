# == Schema Information
#
# Table name: historical_emissions_category
#
#  id   :bigint(8)        not null, primary key
#  name :string           not null
#
# Indexes
#
#

module HistoricalEmissions
  class Category < ApplicationRecord
    include Translate

    belongs_to :sector, class_name: 'HistoricalEmissions::Sector',
                        foreign_key: 'sector_id',
                        required: false
    has_many :sub_categories, class_name: 'HistoricalEmissions::SubCategory'

    translates :name, i18n: :category

    validates_presence_of :name

    def code
      Code.create(read_attribute(:name))
    end
  end
end
