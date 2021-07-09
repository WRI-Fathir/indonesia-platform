class FileManager
  include ActiveModel::Model

  attr_accessor :key, :filename, :last_modified, :owner

  BUCKET_NAME = ENV['S3_BUCKET_NAME']

  class << self
    def all
      @client = Aws::S3::Client.new
      response = @client.list_objects({
        bucket: BUCKET_NAME,
        prefix: CW_FILES_PREFIX
      }).to_h[:contents]

      mapped_list_objects(response)
    end

    def find_by(params)
      filename = params[:filename]&.to_s

      res = all
      res = res.select { |fm| fm.filename.to_s.include?(filename) } if filename.present?

      res
    end

    private

    def mapped_list_objects(response)
      response.map do |res|
        FileManager.new(
          key: res[:key],
          filename: File.basename(res[:key]),
          last_modified: res[:last_modified],
          owner: res[:owner]
        )
      end
    end
  end
end
