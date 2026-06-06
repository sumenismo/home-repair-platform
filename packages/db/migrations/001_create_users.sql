-- migrate:up

CREATE TABLE users (
  id          uuid        PRIMARY KEY,
  email       text        UNIQUE NOT NULL,
  role        text        NOT NULL CHECK (role IN ('HOMEOWNER', 'SERVICE_PROVIDER')),
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homeowner_profiles (
  user_id  uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  address  text,
  barangay text,
  region   text
);

CREATE TABLE service_provider_profiles (
  user_id          uuid    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name    text,
  tin              text,
  is_company       boolean NOT NULL DEFAULT false,
  trade_categories text[]  NOT NULL DEFAULT '{}',
  bio              text,
  verified         boolean NOT NULL DEFAULT false
);
