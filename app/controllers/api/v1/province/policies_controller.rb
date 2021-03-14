module  Api
  module V1
    module Province
      class PoliciesController < ApiController

        def index
          policies = ::Policy.all
          policies = policies.where(code: codes) if codes
          policies = policies.where(section: sections) if sections

          values = ::PolicyValue.includes(:location, :policy, :category)
          values = values.where(locations: { iso_code3: locations }) if locations
          values = values.where(policies: { section: sections }) if sections
          values = values.where(policies: { code: codes }) if codes

          respond_to do |format|
            format.json do
              render json: {
                values: ActiveModelSerializers::SerializableResource.new(
                  values,
                  each_serializer: PolicyValueSerializer
                ).as_json,
                policies: ActiveModelSerializers::SerializableResource.new(
                  policies,
                  each_serializer: PolicySerializer
                ).as_json
              }
            end
            format.zip do
              data_sources = DataSource.all
              data_sources = data_sources.where(short_title: sources) if sources

              render zip: {
                'policies.csv' => PolicyValueCSVSerializer.new(values).to_csv,
                'data_sources.csv' => data_sources.to_csv
              }
            end
          end
        end

        private

        def locations
          params[:location]&.split(',')
        end

        def sections
          params[:sections]&.split(',')
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
end
