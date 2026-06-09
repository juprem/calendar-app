CREATE TABLE general_practitioner (
  id        SERIAL PRIMARY KEY,
  firstname VARCHAR,
  lastname  VARCHAR NOT NULL,
  address   VARCHAR
);

ALTER TABLE contact
  ADD COLUMN general_practitioner_id INTEGER REFERENCES general_practitioner(id);
