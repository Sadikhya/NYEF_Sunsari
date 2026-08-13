USE nyef_sunsari;

INSERT INTO team_members (name, position, category, term, profile_picture, display_order, is_published)
VALUES
  ('SINET RIJAL', 'PRESIDENT', 'executive_committee', NULL, '/assets/team/sinetrijal.jpg', 1, 1),
  ('RAJIV GHIMIRE', 'IMMEDIATE PAST PRESIDENT', 'executive_committee', NULL, '/assets/team/rajiv-ghimire.jpg', 2, 1),
  ('RAKESH SHRESTHA', 'FIRST VICE PRESIDENT', 'executive_committee', NULL, '/assets/team/rakesh-shrestha.jpg', 3, 1),
  ('ABHISHEK BASNET', 'SECOND VICE PRESIDENT', 'executive_committee', NULL, '/assets/team/abhishek-basnet.jpg', 4, 1),
  ('AAKASH DULAL', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/akash-dulal.jpg', 5, 1),
  ('UTSHAB THAPA', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/utshab-thapa.jpg', 6, 1),
  ('JERMAN POUDEL', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/jerman-poudel.jpg', 7, 1),
  ('NISHANT KHEDIA', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/nishant-khedia.jpg', 8, 1),
  ('RAHUL BHANDARI', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/rahul-bhandari.png', 9, 1),
  ('AAVASH BHATTRAI', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/aavash-bhandari.png', 10, 1),
  ('BINITA POUDEL', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/binita-poudel.png', 11, 1),
  ('DIPESH SHRESTHA', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/dipesh-shrestha.jpg', 12, 1),
  ('MISSION PARAJULI', 'EXECUTIVE MEMBER', 'executive_committee', NULL, '/assets/team/mission-parajuli.png', 13, 1),
  ('Mr. Rajiv Ghimire', 'Immediate Past President', 'past_president', '2025-2026', '/assets/team/rajiv-ghimire.jpg', 1, 1),
  ('Mr. Siddhartha Shrestha', 'Past President', 'past_president', '2023-2025', '/assets/team/siddhartha-shrestha.jpeg', 2, 1),
  ('Mr. Chandra Devkota', 'Past President', 'past_president', '2022-2023', '/assets/team/chandra-devkota.jpg', 3, 1),
  ('Mr. Santosh Acharya', 'Past President', 'past_president', '2021-2022', '/assets/team/santosh-acharya.png', 4, 1),
  ('Mr. Sudip Ghimire', 'Founder President', 'past_president', '2019-2020', '/assets/team/sudip-ghimire.png', 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
