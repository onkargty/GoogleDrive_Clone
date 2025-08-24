import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const { folderId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate unique filename
    const fileExtension = originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Save file metadata to database
    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert({
        id: uuidv4(),
        name: originalname,
        size: size,
        type: mimetype,
        storage_path: filePath,
        folder_id: folderId || null,
        owner_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('files').remove([filePath]);
      return res.status(500).json({ error: 'Failed to save file metadata' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { folderId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let query = supabase
      .from('files')
      .select('*')
      .eq('owner_id', userId);

    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }

    const { data: files, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get files error:', error);
      return res.status(500).json({ error: 'Failed to fetch files' });
    }

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get file info first
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('owner_id', userId)
      .single();

    if (fetchError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([file.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('owner_id', userId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return res.status(500).json({ error: 'Failed to delete file' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get file info
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('owner_id', userId)
      .single();

    if (fetchError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get signed URL for download
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('files')
      .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Signed URL error:', urlError);
      return res.status(500).json({ error: 'Failed to generate download URL' });
    }

    res.json({
      downloadUrl: signedUrlData.signedUrl,
      fileName: file.name
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};