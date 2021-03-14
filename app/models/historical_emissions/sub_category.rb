# == Schema Information
#
# Table name: historical_emissions_sub_categories
#
#  id   :bigint(8)        not null, primary key
#  name :string           not null
#
# Indexes
#
#

module HistoricalEmissions
  class SubCategory < ApplicationRecord
    include Translate

    belongs_to :category, class_name: 'HistoricalEmissions::Category',
                        foreign_key: 'category_id',
                        required: false

    translates :name, i18n: :category

    validates_presence_of :name

    def code
      Code.create(read_attribute(:name))
    end
  end
end
