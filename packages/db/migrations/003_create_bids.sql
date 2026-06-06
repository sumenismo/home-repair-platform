-- migrate:up

CREATE TYPE bid_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE bids (
  id           uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id  uuid       NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  service_provider_id uuid       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       bid_status NOT NULL DEFAULT 'PENDING',
  message      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_post_id, service_provider_id)
);

CREATE INDEX idx_bids_job_post         ON bids(job_post_id);
CREATE INDEX idx_bids_service_provider ON bids(service_provider_id);
