module Api
  module V1
    module EmissionActivity
      class ValueCSVSerializer
        def initialize(values)
          @values = Array.wrap(values)
        end

        def to_csv
          year_columns = @values.flat_map(&:emissions).map { |vh| vh['year'] }.compact.uniq.sort

          headers = %w(source location_code location_name sector activity).concat(year_columns)

          CSV.generate do |csv|
            csv << headers

            @values.each do |value|
              value_by_year = value.
                emissions.
                reduce({}) { |acc, v| acc.update(v['year'] => v['value']) }

              csv << [
                value.source,
                value.location.iso_code3,
                value.location.wri_standard_name,
                value.sector&.parent&.name,
                value.sector.name,
                year_columns.map { |yc| value_by_year[yc] }
              ].flatten
            end
          end
        end
      end
    end
  end
end
