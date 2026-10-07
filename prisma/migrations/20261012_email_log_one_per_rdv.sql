DELETE FROM email_log older USING email_log newer
WHERE older.rdv_id = newer.rdv_id AND older.id < newer.id;

ALTER TABLE email_log DROP CONSTRAINT email_log_rdv_id_target_date_key;
ALTER TABLE email_log ADD CONSTRAINT email_log_rdv_id_key UNIQUE (rdv_id);
