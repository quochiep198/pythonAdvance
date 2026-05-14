CREATE DATABASE IF NOT EXISTS python_adventure
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE python_adventure;

CREATE TABLE IF NOT EXISTS lessons (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(120) NOT NULL,
  track VARCHAR(120) NOT NULL DEFAULT 'Cơ bản lớp 6',
  lesson_order INT UNSIGNED NOT NULL,
  chapter VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  objective TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  completion_check_type VARCHAR(32) NOT NULL DEFAULT 'output_contains',
  completion_check_value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lessons_slug (slug),
  UNIQUE KEY uq_lessons_order (lesson_order)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  learner_key VARCHAR(120) NOT NULL,
  lesson_id INT UNSIGNED NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress_learner_lesson (learner_key, lesson_id),
  CONSTRAINT fk_progress_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    ON DELETE CASCADE
);
