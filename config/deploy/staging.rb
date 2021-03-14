# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

server "178.128.210.85", user: "deploy", roles: %w{app db web}

set :rails_env, "production"
