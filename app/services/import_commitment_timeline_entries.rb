#filename: import_commitment_timeline_entries.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

class ImportCommitmentTimelineEntries
  include ClimateWatchEngine::CSVImporter

  headers :text, :note, :year, :link

  DATA_FILEPATH = "#{CW_FILES_PREFIX}commitment_timeline/commitment_timeline_entries.csv".freeze
  DATA_ID_FILEPATH =
    "#{CW_FILES_PREFIX}commitment_timeline/commitment_timeline_entries_id.csv".freeze

  def call
    return unless all_headers_valid?

    ActiveRecord::Base.transaction do
      cleanup
      import_data(csv, DATA_FILEPATH, locale: :en)
      import_data(csv_id, DATA_ID_FILEPATH, locale: :id)
    end
  end

  private

  def all_headers_valid?
    [
      valid_headers?(csv, DATA_FILEPATH, headers),
      valid_headers?(csv_id, DATA_ID_FILEPATH, headers)
    ].all?(true)
  end

  def cleanup
    CommitmentTimeline::Entry.delete_all
  end

  def csv
    @csv ||= S3CSVReader.read(DATA_FILEPATH)
  end

  def csv_id
    @csv_id ||= S3CSVReader.read(DATA_ID_FILEPATH)
  end

  def import_data(csv, filepath, locale: I18n.default_locale)
    import_each_with_logging(csv, filepath) do |row|
      CommitmentTimeline::Entry.create!(
        text: row[:text],
        note: row[:note],
        year: row[:year],
        link: row[:link],
        locale: locale
      )
    end
  end
end
