module Api
  module V1
    module Province
      class MetadataSerializer < ActiveModel::Serializer
        attribute :indicators
        attribute :sectors
        attribute :locations
      end
    end
  end
end
