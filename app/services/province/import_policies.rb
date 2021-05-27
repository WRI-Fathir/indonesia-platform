class Province::ImportPolicies
  include ClimateWatchEngine::CSVImporter

  headers policies: [:section, :plc_code, :policy, :unit],
          policies_id: [:plc_code, :policy],
          policy_values: [:geoid, :plc_code, :source, :description]

  POLICIES_FILEPATH = "#{CW_FILES_PREFIX}province_policies/province_policies.csv"
  POLICIES_ID_FILEPATH = "#{CW_FILES_PREFIX}province_policies/province_policies_id.csv"
  POLICY_VALUES_FILEPATHS = %W(
    #{CW_FILES_PREFIX}province_policies/province_policies_data.csv
  )

  def call
    return unless all_headers_valid?

    ActiveRecord::Base.transaction do
      import_policies
      import_policies_id
      policy_values_csv_hash.each do |filepath, csv|
        import_policy_values(csv, filepath)
      end
    end
  end

  private

  def cleanup
    Policy.delete_all
    PolicyValue.delete_all
    PolicyCategory.delete_all
  end

  def all_headers_valid?
    [
      valid_headers?(policies_csv, POLICIES_FILEPATH, headers[:policies]),
      valid_headers?(policies_id_csv, POLICIES_ID_FILEPATH, headers[:policies_id]),
      policy_values_csv_hash.map do |filepath, csv|
        valid_headers?(csv, filepath, headers[:policy_values])
      end
    ].flatten.all?(true)
  end

  def policies_csv
    @policies_csv ||= S3CSVReader.read(POLICIES_FILEPATH)
  end

  def policies_id_csv
    @policies_id_csv ||= S3CSVReader.read(POLICIES_ID_FILEPATH)
  end

  def policy_values_csv_hash
    @policy_values_csv_hash ||= POLICY_VALUES_FILEPATHS.reduce({}) do |acc, filepath|
      acc.merge(filepath => S3CSVReader.read(filepath))
    end
  end

  def import_policies
    import_each_with_logging(policies_csv, POLICIES_FILEPATH) do |row|
      code = row[:plc_code]
      policy = Policy.where(code: code).first_or_initialize
      policy.update_attributes!(
        code: code,
        section: section(row),
        name: row[:policy],
        unit: row[:unit]
      )
    end
  end

  def import_policies_id
    I18n.with_locale(:id) do
      import_each_with_logging(policies_id_csv, POLICIES_ID_FILEPATH) do |row|
        policy = Policy.find_by!(code: row[:plc_code])
        policy.update_attributes!(name: row[:policy])
      end
    end
  end

  def import_policy_values(csv, filename)
    import_each_with_logging(csv, filename) do |row|
      category = PolicyCategory.find_or_create_by!(name: row[:category]) if row[:category]
      location = Location.find_by(iso_code3: row[:geoid])
      policy = Policy.find_by(code: row[:plc_code])
      source = row[:source]
      policy_value = PolicyValue.where(location: location, policy: policy, category: category, source: source).first_or_initialize
      policy_value.update_attributes!(
        location: location,
        policy: policy,
        category: category,
        source: source,
        description: row[:description],
        values: values(row)
      )
    end
  end

  def section(row)
    section = row[:section]
  end

  def values(row)
    row.headers.grep(/\d{4}/).map do |year|
      {
        year: year.to_s.sub('_', '-'),
        value: row[year]&.delete('%,', ',')&.to_f
      }
    end
  end
end
