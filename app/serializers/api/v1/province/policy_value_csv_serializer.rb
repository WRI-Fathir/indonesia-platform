module Api
  module V1
    module Province
      class PolicyValueCSVSerializer
        def initialize(values)
          @values = Array.wrap(values)
        end

        def to_csv
          year_columns = @values.flat_map(&:values).map { |vh| vh['year'] }.compact.uniq.sort

          headers = %w(source location_code location_name policy_code policy_name category description).concat(year_columns)

          CSV.generate do |csv|
            csv << headers

            @values.each do |plc_value|
              value_by_year = plc_value.
                values.
                reduce({}) { |acc, v| acc.update(v['year'] => v['value']) }

              csv << [
                plc_value.source,
                plc_value.location.iso_code3,
                plc_value.location.wri_standard_name,
                plc_value.policy.code,
                plc_value.policy.name,
                plc_value.category&.name,
                plc_value.description,
                year_columns.map { |yc| value_by_year[yc] }
              ].flatten
            end
          end
        end
      end
    end
  end
end

