#filename: sector_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

HistoricalEmissions::Sector.class_eval do
  include Translate

  translates :name, i18n: :sector

  has_many :categories, class_name: 'HistoricalEmissions::Category'

  def code
    Code.create(read_attribute(:name))
  end
end
