module Api
  module V1
    module Province
      class PolicySerializer < ActiveModel::Serializer
        attributes :section, :code, :name, :unit, :description
      end
    end
  end
end
