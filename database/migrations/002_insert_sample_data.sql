-- Insert sample folder data using CTEs for proper foreign key handling

-- Insert root folders and get their IDs
WITH root_folders AS (
  INSERT INTO folders (name, parent_id) VALUES
  ('Documents', NULL),
  ('Pictures', NULL),
  ('Projects', NULL)
  RETURNING id, name
),

-- Insert level 1 subfolders
level1_folders AS (
  INSERT INTO folders (name, parent_id)
  SELECT 'Work', id FROM root_folders WHERE name = 'Documents'
  UNION ALL
  SELECT 'Personal', id FROM root_folders WHERE name = 'Documents'
  UNION ALL
  SELECT 'Archive', id FROM root_folders WHERE name = 'Documents'
  UNION ALL
  SELECT 'Vacation 2023', id FROM root_folders WHERE name = 'Pictures'
  UNION ALL
  SELECT 'Family Photos', id FROM root_folders WHERE name = 'Pictures'
  UNION ALL
  SELECT 'Screenshots', id FROM root_folders WHERE name = 'Pictures'
  UNION ALL
  SELECT 'Web Projects', id FROM root_folders WHERE name = 'Projects'
  UNION ALL
  SELECT 'Mobile Apps', id FROM root_folders WHERE name = 'Projects'
  UNION ALL
  SELECT 'Scripts', id FROM root_folders WHERE name = 'Projects'
  RETURNING id, name, parent_id
),

-- Insert level 2 subfolders
level2_folders AS (
  INSERT INTO folders (name, parent_id)
  SELECT 'Reports', id FROM level1_folders WHERE name = 'Work'
  UNION ALL
  SELECT 'Presentations', id FROM level1_folders WHERE name = 'Work'
  UNION ALL
  SELECT 'Contracts', id FROM level1_folders WHERE name = 'Work'
  UNION ALL
  SELECT 'React Apps', id FROM level1_folders WHERE name = 'Web Projects'
  UNION ALL
  SELECT 'Vue Projects', id FROM level1_folders WHERE name = 'Web Projects'
  UNION ALL
  SELECT 'Node APIs', id FROM level1_folders WHERE name = 'Web Projects'
  RETURNING id, name, parent_id
),

-- Insert level 3 subfolders
level3_folders AS (
  INSERT INTO folders (name, parent_id)
  SELECT 'File Explorer', id FROM level2_folders WHERE name = 'Vue Projects'
  UNION ALL
  SELECT 'E-commerce Site', id FROM level2_folders WHERE name = 'Vue Projects'
  UNION ALL
  SELECT 'Blog Platform', id FROM level2_folders WHERE name = 'Vue Projects'
  RETURNING id, name, parent_id
)

-- Insert sample files into the File Explorer folder
INSERT INTO files (name, folder_id, size_bytes)
SELECT 'README.md', id, 1024 FROM level3_folders WHERE name = 'File Explorer'
UNION ALL
SELECT 'package.json', id, 2048 FROM level3_folders WHERE name = 'File Explorer'
UNION ALL
SELECT 'index.html', id, 4096 FROM level3_folders WHERE name = 'File Explorer'
UNION ALL
SELECT 'app.vue', id, 8192 FROM level3_folders WHERE name = 'File Explorer';