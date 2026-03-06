-- schema.sql
-- Estructura de tablas para PostgreSQL en Render

CREATE TABLE IF NOT EXISTS users_user (
    id bigserial PRIMARY KEY,
    password varchar(128) NOT NULL,
    last_login timestamp with time zone NULL,
    is_superuser boolean NOT NULL,
    username varchar(150) NOT NULL UNIQUE,
    first_name varchar(150) NOT NULL,
    last_name varchar(150) NOT NULL,
    email varchar(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL,
    dni varchar(8) NOT NULL UNIQUE,
    points integer NOT NULL,
    current_streak integer NOT NULL
);

CREATE TABLE IF NOT EXISTS exams_exam (
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL,
    description text NOT NULL,
    bank_total_questions integer NOT NULL,
    questions_per_attempt integer NOT NULL,
    max_scored_attempts integer NOT NULL,
    max_points integer NOT NULL,
    is_active boolean NOT NULL,
    is_enabled boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS exams_question (
    id bigserial PRIMARY KEY,
    exam_id bigint NOT NULL REFERENCES exams_exam(id) DEFERRABLE INITIALLY DEFERRED,
    text text NOT NULL,
    points integer NOT NULL,
    time_limit_seconds integer NOT NULL,
    question_type varchar(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS exams_option (
    id bigserial PRIMARY KEY,
    question_id bigint NOT NULL REFERENCES exams_question(id) DEFERRABLE INITIALLY DEFERRED,
    text text NOT NULL,
    is_correct boolean NOT NULL
);
