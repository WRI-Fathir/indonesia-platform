class PolicyValue < ApplicationRecord
  include ClimateWatchEngine::GenericToCsv

  belongs_to :location
  belongs_to :category, class_name: 'PolicyCategory', optional: true
  belongs_to :policy
end
