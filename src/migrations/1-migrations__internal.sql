CREATE TABLE db_migrations (
    id SERIAL PRIMARY KEY,
    name character varying(64) NOT NULL,
    ts_created bigint NOT NULL,
    ts_updated bigint NOT NULL
);
