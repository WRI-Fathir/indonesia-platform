module Api
  module V1
    module EmissionProjection
      class ValueSerializer < ActiveModel::Serializer
        attribute :source
        attribute :location
        attribute :location_iso_code3
        attribute :sector
        attribute :developed_by
        attribute :model
        attribute :model_code
        attribute :scenario
        attribute :values

        def location
          object.location.wri_standard_name
        end

        def location_iso_code3
          object.location.iso_code3
        end

        def model_code
          object.model.code
        end

        def model
          object.model.name
        end

        def sector
          object.sector.name
        end

        def scenario
          object.scenario.name
        end
      end
    end
  end
end
