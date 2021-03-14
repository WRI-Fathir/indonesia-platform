module Api
  module V1
    class EmissionProjectionsController < ApiController
      def index
        values = ::EmissionProjectionValue.includes(:location, :model, :scenario, :sector)
        values = values.where(locations: {iso_code3: locations}) if locations

        respond_to do |format|
          format.json do
            render json: values,
                   each_serializer: Api::V1::EmissionProjection::ValueSerializer
          end
          format.zip do
            projection_sources = values.map(&:source)

            data_sources = DataSource.where(
              short_title: (projection_sources).uniq
            )

            render zip: {
              'emission_activities.csv' =>
                Api::V1::EmissionProjection::ValueCSVSerializer.new(values).to_csv,
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
