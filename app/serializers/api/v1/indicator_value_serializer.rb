module Api
  module V1
    class IndicatorValueSerializer < ActiveModel::Serializer
      attribute :indicator_code
      attribute :indicator_id
      attribute :location
      attribute :location_iso_code3
      attribute :location_id
      attribute :category
      attribute :category_id
      attribute :values
      attribute :source

      def category
        object.category&.name
      end

      def category_id
        object.category&.id
      end

      def location
        object.location.wri_standard_name
      end

      def location_iso_code3
        object.location.iso_code3
      end

      def location_id
        object.location&.id
      end

      def indicator_code
        object.indicator.code
      end

      def indicator_id
        object.indicator&.id
      end
    end
  end
end
