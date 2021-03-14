class EmissionProjectionValue < ApplicationRecord
  include ClimateWatchEngine::GenericToCsv

  belongs_to :location
  belongs_to :model, class_name: 'EmissionProjectionModel', optional: true
  belongs_to :scenario, class_name: 'EmissionProjectionScenario', optional: true
  belongs_to :sector, class_name: 'EmissionProjectionSector', optional: true
end
