-- migrate:up

CREATE TYPE job_post_status AS ENUM ('OPEN', 'IN_REVIEW', 'ACCEPTED', 'CLOSED');

CREATE TABLE job_posts (
  id           uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        text            NOT NULL,
  description  text            NOT NULL,
  category     text            NOT NULL,
  street            text,
  barangay          text,
  city_municipality text,
  province          text,
  region            text,
  status       job_post_status NOT NULL DEFAULT 'OPEN',
  created_at   timestamptz     NOT NULL DEFAULT now(),
  updated_at   timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_posts_status    ON job_posts(status);
CREATE INDEX idx_job_posts_category  ON job_posts(category);
CREATE INDEX idx_job_posts_homeowner ON job_posts(homeowner_id);
