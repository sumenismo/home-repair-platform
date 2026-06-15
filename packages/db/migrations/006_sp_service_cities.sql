-- migrate:up
ALTER TABLE service_provider_profiles
  ADD COLUMN service_cities text[] NOT NULL DEFAULT '{}';
