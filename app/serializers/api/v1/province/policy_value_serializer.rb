module Api
  module V1
    module Province
      class PolicyValueSerializer < ActiveModel::Serializer
        attribute :policy_code
        attribute :location
        attribute :location_iso_code3
        attribute :category
        attribute :values
        attribute :source

        def category
          object.category&.name
        end

        def location
          object.location.wri_standard_name
        end

        def location_iso_code3
          object.location.iso_code3
        end

        def policy_code
          object.policy.code
        end
      end
    end
  end
end
