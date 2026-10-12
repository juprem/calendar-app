CREATE TABLE email_log (
  id          SERIAL PRIMARY KEY,
  rdv_id      INTEGER NOT NULL REFERENCES rdv(id) ON DELETE CASCADE,
  contact_id  INTEGER NOT NULL REFERENCES contact(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  recipient   VARCHAR,
  status      VARCHAR NOT NULL,
  error       TEXT,
  sent_at     TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT email_log_rdv_id_target_date_key UNIQUE (rdv_id, target_date)
);
