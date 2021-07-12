#filename: application_controller_decorator.rb
#author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
#repository: https://github.com/anggiaramadhan/indonesia-platform

Locations::ApplicationController.class_eval do
  include Localizable
end
