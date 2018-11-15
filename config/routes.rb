Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  mount Locations::Engine => 'api/v1/locations'
  mount HistoricalEmissions::Engine => 'api/v1'

  namespace :api do
    namespace :v1 do
      resources :emission_targets, only: [:index], defaults: { format: 'json' }
      resources :emission_activities, only: [:index], defaults: { format: 'json' }
      resources :commitment_timeline_entries, only: [:index]
      resources :section_content, only: [:index], defaults: { format: 'json' }
    end
  end

  root 'application#index'
  get '(*frontend)', to: 'application#index'
end
