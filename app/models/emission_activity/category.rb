module EmissionActivity
  class Category < ApplicationRecord
    include Translate

    translates :name, i18n: :sector

    validates :name, presence: true, uniqueness: true

    def code
      Code.create(read_attribute(:name))
    end
  end
end
