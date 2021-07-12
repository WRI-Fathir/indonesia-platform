#filename: location_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

Location.class_eval do
  include Translate

  translates :wri_standard_name
end
