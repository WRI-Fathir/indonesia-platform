#filename: gas_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

HistoricalEmissions::Gas.class_eval do
  include Translate

  translates :name, i18n: :gas

  def code
    Code.create(read_attribute(:name))
  end
end
