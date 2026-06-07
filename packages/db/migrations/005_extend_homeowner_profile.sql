-- migrate:up
ALTER TABLE homeowner_profiles
  ADD COLUMN province          text,
  ADD COLUMN city_municipality text;
