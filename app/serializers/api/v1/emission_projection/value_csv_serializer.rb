module Api
  module V1
    module EmissionProjection
      class ValueCSVSerializer
        def initialize(values)
          @values = Array.wrap(values)
        end

        def to_csv
          year_columns = @values.flat_map(&:values).map { |vh| vh['year'] }.compact.uniq.sort

          headers = %w(source location_code location_name sector developed_by model scenario).concat(year_columns)

          CSV.generate do |csv|
            csv << headers

            @values.each do |value|
              value_by_year = value.
                values.
                reduce({}) { |acc, v| acc.update(v['year'] => v['value']) }

              csv << [
                value.source,
                value.location.iso_code3,
                value.location.wri_standard_name,
                value.sector.name,
                value.developed_by,
                value.model.name,
                value.scenario.name,
                year_columns.map { |yc| value_by_year[yc] }
              ].flatten
            end
          end
        end
      end
    end
  end
end
