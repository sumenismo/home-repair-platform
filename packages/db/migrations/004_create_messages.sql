-- migrate:up

CREATE TABLE messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id  uuid        NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  sender_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_job_post ON messages(job_post_id);
