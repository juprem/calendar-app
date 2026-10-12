CREATE TABLE export_log (
  id          SERIAL PRIMARY KEY,
  exported_at TIMESTAMPTZ(6) NOT NULL
);
