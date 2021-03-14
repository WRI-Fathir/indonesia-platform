Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  mount Locations::Engine => 'api/v1/locations'

  mount HistoricalEmissions::Engine => 'api/v1'
  get 'api/v1/emissions/download', to: 'historical_emissions/historical_emissions#download'

  namespace :api do
    namespace :v1, defaults: { format: :json } do
      resources :commitment_timeline_entries, only: [:index]
      resources :emission_activities, only: [:index]
      resources :emission_targets, only: [:index]
      resources :funding_opportunities, only: [:index]
      resources :indicators, only: [:index]
      resources :metadata, only: [:index]
      resources :translations, only: [:index]
      resources :emission_projections, only: [:index]

      namespace :province do
        resources :climate_plans, only: [:index]
        resources :policies, only: [:index]
        resources :development_plans, only: [:index]
        resources :metadata , only: [:index]
      end
    end
  end

  root 'application#index'
  get '(*frontend)', to: 'application#index'
end
