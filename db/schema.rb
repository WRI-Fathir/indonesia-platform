# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_09_17_045456) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "role", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "commitment_timeline_entries", force: :cascade do |t|
    t.text "text"
    t.text "note"
    t.text "link"
    t.string "year"
    t.string "locale", default: "en", null: false
  end

  create_table "data_sources", force: :cascade do |t|
    t.string "short_title"
    t.string "title"
    t.string "source_organization"
    t.string "learn_more_link"
    t.text "summary"
    t.text "description"
    t.text "caution"
    t.text "citation"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "translations", default: {}
    t.index ["short_title"], name: "index_data_sources_on_short_title", unique: true
  end

  create_table "datasets", force: :cascade do |t|
    t.string "name"
    t.bigint "section_id"
    t.index ["section_id", "name"], name: "datasets_section_id_name_key", unique: true
    t.index ["section_id"], name: "index_datasets_on_section_id"
  end

  create_table "emission_activity_categories", force: :cascade do |t|
    t.text "name", null: false
    t.jsonb "translations", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_emission_activity_categories_on_name", unique: true
  end

  create_table "emission_activity_sectors", force: :cascade do |t|
    t.text "name"
    t.bigint "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id"
    t.index ["category_id"], name: "index_emission_activity_sectors_on_category_id"
    t.index ["name", "parent_id"], name: "index_emission_activity_sectors_on_name_and_parent_id", unique: true
    t.index ["parent_id"], name: "index_emission_activity_sectors_on_parent_id"
  end

  create_table "emission_activity_values", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "sector_id"
    t.jsonb "emissions"
    t.string "source"
    t.index ["location_id"], name: "index_emission_activity_values_on_location_id"
    t.index ["sector_id"], name: "index_emission_activity_values_on_sector_id"
  end

  create_table "emission_projection_models", force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "sector_id"
    t.index ["code"], name: "index_emission_projection_models_on_code", unique: true
    t.index ["sector_id"], name: "index_emission_projection_models_on_sector_id"
  end

  create_table "emission_projection_scenarios", force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "translations", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_emission_projection_scenarios_on_name", unique: true
  end

  create_table "emission_projection_sectors", force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "translations", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_emission_projection_sectors_on_name", unique: true
  end

  create_table "emission_projection_values", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "model_id"
    t.bigint "scenario_id"
    t.bigint "sector_id"
    t.string "source"
    t.string "developed_by"
    t.jsonb "values"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["location_id"], name: "index_emission_projection_values_on_location_id"
    t.index ["model_id"], name: "index_emission_projection_values_on_model_id"
    t.index ["scenario_id"], name: "index_emission_projection_values_on_scenario_id"
    t.index ["sector_id"], name: "index_emission_projection_values_on_sector_id"
  end

  create_table "emission_target_labels", force: :cascade do |t|
    t.text "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_emission_target_labels_on_name", unique: true
  end

  create_table "emission_target_sectors", force: :cascade do |t|
    t.text "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_emission_target_sectors_on_name", unique: true
  end

  create_table "emission_target_values", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "label_id"
    t.bigint "sector_id"
    t.integer "year"
    t.float "first_value"
    t.float "second_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "source"
    t.string "unit"
    t.index ["label_id"], name: "index_emission_target_values_on_label_id"
    t.index ["location_id"], name: "index_emission_target_values_on_location_id"
    t.index ["sector_id"], name: "index_emission_target_values_on_sector_id"
  end

  create_table "funding_opportunities", force: :cascade do |t|
    t.string "source"
    t.text "project_name"
    t.text "mode_of_support"
    t.text "sectors_and_topics"
    t.text "description"
    t.text "application_procedure"
    t.text "website_link"
    t.integer "last_update_year"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "locale", default: "en", null: false
  end

  create_table "historical_emissions_categories", force: :cascade do |t|
    t.text "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "sector_id"
    t.index ["name"], name: "index_historical_emissions_categories_on_name"
    t.index ["sector_id"], name: "index_historical_emissions_categories_on_sector_id"
  end

  create_table "historical_emissions_data_sources", force: :cascade do |t|
    t.text "name"
    t.text "display_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "historical_emissions_gases", force: :cascade do |t|
    t.text "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "unit"
  end

  create_table "historical_emissions_gwps", force: :cascade do |t|
    t.text "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "historical_emissions_metrics", force: :cascade do |t|
    t.string "name", null: false
    t.string "unit", null: false
    t.index ["name", "unit"], name: "index_historical_emissions_metrics_on_name_and_unit", unique: true
  end

  create_table "historical_emissions_records", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "data_source_id"
    t.bigint "sector_id"
    t.bigint "gas_id"
    t.bigint "gwp_id"
    t.jsonb "emissions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "metric_id"
    t.bigint "category_id"
    t.bigint "sub_category_id"
    t.index ["category_id"], name: "index_historical_emissions_records_on_category_id"
    t.index ["data_source_id"], name: "index_historical_emissions_records_on_data_source_id"
    t.index ["gas_id"], name: "index_historical_emissions_records_on_gas_id"
    t.index ["gwp_id"], name: "index_historical_emissions_records_on_gwp_id"
    t.index ["location_id"], name: "index_historical_emissions_records_on_location_id"
    t.index ["metric_id"], name: "index_historical_emissions_records_on_metric_id"
    t.index ["sector_id"], name: "index_historical_emissions_records_on_sector_id"
    t.index ["sub_category_id"], name: "index_historical_emissions_records_on_sub_category_id"
  end

  create_table "historical_emissions_sectors", force: :cascade do |t|
    t.bigint "parent_id"
    t.bigint "data_source_id"
    t.text "name"
    t.text "annex_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["data_source_id"], name: "index_historical_emissions_sectors_on_data_source_id"
    t.index ["parent_id"], name: "index_historical_emissions_sectors_on_parent_id"
  end

  create_table "historical_emissions_sub_categories", force: :cascade do |t|
    t.text "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id"
    t.index ["category_id"], name: "index_historical_emissions_sub_categories_on_category_id"
    t.index ["name"], name: "index_historical_emissions_sub_categories_on_name"
  end

  create_table "indicator_categories", force: :cascade do |t|
    t.text "name", null: false
    t.jsonb "translations", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_indicator_categories_on_name", unique: true
  end

  create_table "indicator_values", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "indicator_id"
    t.string "source"
    t.jsonb "values"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id"
    t.index ["category_id"], name: "index_indicator_values_on_category_id"
    t.index ["indicator_id"], name: "index_indicator_values_on_indicator_id"
    t.index ["location_id"], name: "index_indicator_values_on_location_id"
  end

  create_table "indicators", force: :cascade do |t|
    t.string "section", null: false
    t.string "code", null: false
    t.string "name", null: false
    t.string "unit"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "translations", default: {}
    t.index ["code"], name: "index_indicators_on_code", unique: true
    t.index ["section"], name: "index_indicators_on_section"
  end

  create_table "location_members", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "member_id"
    t.index ["location_id"], name: "index_location_members_on_location_id"
    t.index ["member_id"], name: "index_location_members_on_member_id"
  end

  create_table "locations", force: :cascade do |t|
    t.text "iso_code3", null: false
    t.text "iso_code2", null: false
    t.text "location_type", null: false
    t.text "wri_standard_name", null: false
    t.boolean "show_in_cw", default: true, null: false
    t.text "pik_name"
    t.text "cait_name"
    t.text "ndcp_navigators_name"
    t.text "unfccc_group"
    t.json "topojson"
    t.jsonb "centroid"
    t.text "capital_city"
    t.jsonb "translations", default: {}
  end

  create_table "platforms", force: :cascade do |t|
    t.string "name"
    t.index ["name"], name: "platforms_name_key", unique: true
  end

  create_table "policies", force: :cascade do |t|
    t.string "section", null: false
    t.string "code", null: false
    t.string "name", null: false
    t.string "unit"
    t.text "description"
    t.jsonb "translations", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_policies_on_code", unique: true
    t.index ["section"], name: "index_policies_on_section"
  end

  create_table "policy_categories", force: :cascade do |t|
    t.text "name", null: false
    t.jsonb "translations", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_policy_categories_on_name", unique: true
  end

  create_table "policy_values", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "policy_id"
    t.string "source"
    t.jsonb "values"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id"
    t.text "description"
    t.index ["category_id"], name: "index_policy_values_on_category_id"
    t.index ["location_id"], name: "index_policy_values_on_location_id"
    t.index ["policy_id"], name: "index_policy_values_on_policy_id"
  end

  create_table "province_climate_plans", force: :cascade do |t|
    t.bigint "location_id"
    t.text "mitigation_activities"
    t.string "source"
    t.string "sector"
    t.string "sub_sector"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "locale", default: "en", null: false
    t.index ["location_id"], name: "index_province_climate_plans_on_location_id"
  end

  create_table "province_development_plans", force: :cascade do |t|
    t.bigint "location_id"
    t.string "source"
    t.string "rpjmd_period"
    t.text "supportive_mission_statement"
    t.jsonb "supportive_policy_directions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "locale", default: "en", null: false
    t.index ["location_id"], name: "index_province_development_plans_on_location_id"
  end

  create_table "sections", force: :cascade do |t|
    t.string "name"
    t.bigint "platform_id"
    t.index ["platform_id", "name"], name: "sections_platform_id_name_key", unique: true
    t.index ["platform_id"], name: "index_sections_on_platform_id"
  end

  create_table "translations", force: :cascade do |t|
    t.string "locale"
    t.string "key"
    t.text "value"
    t.text "interpolations"
    t.boolean "is_proc", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "worker_logs", force: :cascade do |t|
    t.integer "state"
    t.string "jid"
    t.bigint "section_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "user_email"
    t.jsonb "details", default: {}
    t.index ["jid"], name: "index_worker_logs_on_jid"
    t.index ["section_id"], name: "index_worker_logs_on_section_id"
  end

  add_foreign_key "datasets", "sections"
  add_foreign_key "emission_activity_sectors", "emission_activity_categories", column: "category_id", on_delete: :cascade
  add_foreign_key "emission_activity_sectors", "emission_activity_sectors", column: "parent_id", on_delete: :cascade
  add_foreign_key "emission_activity_values", "emission_activity_sectors", column: "sector_id", on_delete: :cascade
  add_foreign_key "emission_activity_values", "locations", on_delete: :cascade
  add_foreign_key "emission_projection_models", "emission_projection_sectors", column: "sector_id"
  add_foreign_key "emission_projection_values", "emission_projection_models", column: "model_id", on_delete: :cascade
  add_foreign_key "emission_projection_values", "emission_projection_scenarios", column: "scenario_id", on_delete: :cascade
  add_foreign_key "emission_projection_values", "emission_projection_sectors", column: "sector_id", on_delete: :cascade
  add_foreign_key "emission_projection_values", "locations", on_delete: :cascade
  add_foreign_key "emission_target_values", "emission_target_labels", column: "label_id", on_delete: :cascade
  add_foreign_key "emission_target_values", "emission_target_sectors", column: "sector_id", on_delete: :cascade
  add_foreign_key "emission_target_values", "locations", on_delete: :cascade
  add_foreign_key "historical_emissions_categories", "historical_emissions_sectors", column: "sector_id"
  add_foreign_key "historical_emissions_records", "historical_emissions_categories", column: "category_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "historical_emissions_data_sources", column: "data_source_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "historical_emissions_gases", column: "gas_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "historical_emissions_gwps", column: "gwp_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "historical_emissions_metrics", column: "metric_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "historical_emissions_sectors", column: "sector_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "historical_emissions_sub_categories", column: "sub_category_id", on_delete: :cascade
  add_foreign_key "historical_emissions_records", "locations", on_delete: :cascade
  add_foreign_key "historical_emissions_sectors", "historical_emissions_data_sources", column: "data_source_id", on_delete: :cascade
  add_foreign_key "historical_emissions_sectors", "historical_emissions_sectors", column: "parent_id", on_delete: :cascade
  add_foreign_key "historical_emissions_sub_categories", "historical_emissions_categories", column: "category_id"
  add_foreign_key "indicator_values", "indicator_categories", column: "category_id", on_delete: :cascade
  add_foreign_key "indicator_values", "indicators", on_delete: :cascade
  add_foreign_key "indicator_values", "locations", on_delete: :cascade
  add_foreign_key "location_members", "locations", column: "member_id", on_delete: :cascade
  add_foreign_key "location_members", "locations", on_delete: :cascade
  add_foreign_key "policy_values", "locations", on_delete: :cascade
  add_foreign_key "policy_values", "policies", on_delete: :cascade
  add_foreign_key "policy_values", "policy_categories", column: "category_id", on_delete: :cascade
  add_foreign_key "province_climate_plans", "locations", on_delete: :cascade
  add_foreign_key "province_development_plans", "locations", on_delete: :cascade
  add_foreign_key "sections", "platforms"
  add_foreign_key "worker_logs", "sections"
end
