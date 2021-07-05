module Api
  module V1
    class EmissionActivitiesController < ApiController
      def index
        values = ::EmissionActivity::Value.includes(:location, sector: [:parent])
        values = values.where(locations: {iso_code3: locations}) if locations

        respond_to do |format|
          format.json do
            render json: values,
                   each_serializer: Api::V1::EmissionActivity::ValueSerializer
          end
          format.zip do
            adaptation = ::IndicatorValue.
              includes(:location, :indicator, :category).
              where(indicators: {code: ::Indicator::ADAPTATION})
            adaptation_sources = adaptation.map(&:source)
            activity_sources = values.map(&:source)

            data_sources = DataSource.where(
              short_title: (adaptation_sources + activity_sources).uniq
            )

            render zip: {
              'adaptation.csv' => Api::V1::IndicatorValueCSVSerializer.new(adaptation).to_csv,
              'emission_activities.csv' =>
                Api::V1::EmissionActivity::ValueCSVSerializer.new(values).to_csv,
              'data_sources.csv' => data_sources.to_csv
            }
          end
        end
      end

      private

      def locations
        params[:location].presence && params[:location].split(',')
      end
    end
  end
end
