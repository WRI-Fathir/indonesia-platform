module Api
  module V1
    class IndicatorsController < ApiController
      # rubocop:disable AbcSize
      def index
        indicators = ::Indicator.all
        indicators = indicators.where(code: codes) if codes
        indicators = indicators.where(section: sections) if sections

        values = ::IndicatorValue.includes(:location, :indicator, :category)
        values = values.where(locations: {iso_code3: locations}) if locations
        values = values.where(indicators: {section: sections}) if sections
        values = values.where(indicators: {code: codes}) if codes

        respond_to do |format|
          format.json do
            render json: {
              values: ActiveModelSerializers::SerializableResource.new(
                values,
                each_serializer: IndicatorValueSerializer
              ).as_json,
              indicators: ActiveModelSerializers::SerializableResource.new(
                indicators,
                each_serializer: IndicatorSerializer
              ).as_json
            }
          end
          format.zip do
            data_sources = DataSource.all
            data_sources = data_sources.where(short_title: sources) if sources

            render zip: {
              'indicators.csv' => IndicatorValueCSVSerializer.new(values).to_csv,
              'data_sources.csv' => data_sources.to_csv
            }
          end
        end
      end
      # rubocop:enable AbcSize

      private

      def locations
        params[:location]&.split(',')
      end

      def sections
        params[:section]&.split(',')
      end

      def codes
        params[:code]&.split(',')
      end

      def sources
        params[:source]&.split(',')
      end
    end
  end
end
