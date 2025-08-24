/*
  # Google Drive Clone Database Schema

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, folder name)
      - `parent_id` (uuid, reference to parent folder)
      - `owner_id` (uuid, reference to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `files`
      - `id` (uuid, primary key)
      - `name` (text, original filename)
      - `size` (bigint, file size in bytes)
      - `type` (text, MIME type)
      - `storage_path` (text, path in Supabase storage)
      - `folder_id` (uuid, reference to folders table)
      - `owner_id` (uuid, reference to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create 'files' storage bucket for file uploads

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Configure storage policies for file access
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'application/octet-stream',
  storage_path text NOT NULL UNIQUE,
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies for folders table
CREATE POLICY "Users can view their own folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own folders"
  ON folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own folders"
  ON folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own folders"
  ON folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create policies for files table
CREATE POLICY "Users can view their own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own files"
  ON files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_owner_id ON folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_storage_path ON files(storage_path);

-- Create storage bucket for files (this needs to be done via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

-- Create storage policies (these need to be created after the bucket exists)
-- CREATE POLICY "Users can upload their own files"
--   ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own files"
--   ON storage.objects
--   FOR SELECT
--   TO authenticated
--   USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own files"
--   ON storage.objects
--   FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);