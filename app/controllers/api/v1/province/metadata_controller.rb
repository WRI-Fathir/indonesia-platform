module Api
  module V1
    module Province
      class MetadataController < ApiController
        before_action :fetch_values, only: :meta

        ProvinceMetadata = Struct.new(
          :indicators,
          :sectors,
          :locations
        )

        def index
          province_metadata = ProvinceMetadata.new(
            fetch_meta_indicators,
            fetch_meta_sectors,
            fetch_locations
          )

          respond_to do |format|
            format.json do
              render json: province_metadata,
                     each_serializer: Api::V1::Province::MetadataSerializer
            end
          end
        end

        private

        def location
          params[:location]
        end

        def sections
          params[:section]&.split(",")
        end

        def selected_model
          params[:code]&.split("-")&.last
        end

        def fetch_meta_indicators
          indicators = ::Indicator.all
          indicators = indicators.where(section: sections) if sections
          indicators.map do |indicator|
            {
              id: indicator.id,
              section: indicator.section,
              code: indicator.code,
              name: indicator.name,
              unit: indicator.unit,
              override: true,
            }
          end
        end

        def fetch_meta_sectors
          ::IndicatorCategory.where(id: category_ids).map do |category|
            {
              id: category.id,
              name: category.name,
              code: category.id,
            }
          end
        end

        def fetch_locations
          province = ::Location.find_by(iso_code3: location)
          locations = ::Location.includes(:location_members)
          locations = locations.where(location_members: { member_id: province.id })
          locations.map do |loc|
            {
              id: loc.id,
              iso_code3: loc.iso_code3,
              name: loc.wri_standard_name,
            }
          end
        end

        def fetch_values
          indicators = ::Indicator.where(section: sections) if sections
          values = ::IndicatorValue.includes(:location, :indicator, :category)
          values = values.where(locations: { iso_code3: location }) if location
          values = values.where(indicators: { id: indicators.pluck(:id) })
        end

        def category_ids
          fetch_values.pluck(:category_id).compact.uniq
        end
      end
    end
  end
end
