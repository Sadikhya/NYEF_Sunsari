CREATE DATABASE IF NOT EXISTS nyef_sunsari;

USE nyef_sunsari;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admins_email_unique (email)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_sessions_token_hash_unique (token_hash),
  KEY admin_sessions_admin_id_index (admin_id),
  CONSTRAINT admin_sessions_admin_id_fk FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  business VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  position VARCHAR(150) NOT NULL,
  category ENUM('executive_committee', 'past_president', 'general_member') NOT NULL,
  term VARCHAR(80) NULL,
  business VARCHAR(255) NULL,
  contact VARCHAR(50) NULL,
  address VARCHAR(255) NULL,
  profile_picture VARCHAR(500) NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY team_members_category_name_unique (category, name),
  KEY team_members_public_order_index (is_published, category, display_order, id)
);

CREATE TABLE IF NOT EXISTS site_content (
  content_key VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (content_key)
);

INSERT INTO site_content (content_key, title, body, image_url)
VALUES
  ('president_message', 'Mr. Sinet Rijal', 'Your involvement is what makes NYEF Sunsari strong. I thank all predecessors for their visionary leadership and thank all of you for keeping the spirit alive. While we are still in our early years, we are laying down strong foundations for the future. Let us grow together, evolve as an impactful chapter, and create an entrepreneurial community that uplifts the nation.', '/assets/team/sinetrijal.jpg'),
  ('focus_intro', 'Our Key Focus Areas', 'We create tangible value for our members and community through strategic initiatives.', NULL),
  ('focus_1', 'Startup Ecosystem', 'Launching and supporting new ventures through bootcamps and pitch competitions.', '*'),
  ('focus_2', 'Powerful Networking', 'Building valuable connections through exclusive meetups and events.', 'N'),
  ('focus_3', 'Leadership & Mentorship', 'Developing future leaders with guidance from seasoned experts.', 'L'),
  ('focus_4', 'Policy Advocacy', 'Championing a better business environment for young entrepreneurs.', 'P'),
  ('values_intro', 'The Values That Drive Us', '', NULL),
  ('value_1', 'Growth with Shared Vision', 'We believe in collective leadership, teamwork, and mutual trust to achieve our common goals.', NULL),
  ('value_2', 'Hunger for Learning', 'We foster a culture of continuous improvement, treating failures as learning opportunities.', NULL),
  ('value_3', 'Nation First', 'We place Nepal''s interests above all, contributing to our nation''s prosperity through entrepreneurship.', NULL),
  ('value_4', 'Make a Mark', 'We embrace change, foster innovation, and constantly seek better ways of doing things.', NULL)
ON DUPLICATE KEY UPDATE content_key = content_key;
