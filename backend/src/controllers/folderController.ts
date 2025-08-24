import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export const createFolder = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check if folder with same name exists in the same parent
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('id')
      .eq('name', name.trim())
      .eq('owner_id', userId)
      .eq('parent_id', parentId || null)
      .single();

    if (existingFolder) {
      return res.status(409).json({ error: 'Folder with this name already exists' });
    }

    // Create new folder
    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        id: uuidv4(),
        name: name.trim(),
        parent_id: parentId || null,
        owner_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Create folder error:', error);
      return res.status(500).json({ error: 'Failed to create folder' });
    }

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFolders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { parentId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let query = supabase
      .from('folders')
      .select('*')
      .eq('owner_id', userId);

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data: folders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get folders error:', error);
      return res.status(500).json({ error: 'Failed to fetch folders' });
    }

    res.json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFolder = async (req: AuthRequest, res: Response) => {
  try {
    const { folderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if folder exists and belongs to user
    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('owner_id', userId)
      .single();

    if (fetchError || !folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder has any files or subfolders
    const { data: files } = await supabase
      .from('files')
      .select('id')
      .eq('folder_id', folderId)
      .limit(1);

    const { data: subfolders } = await supabase
      .from('folders')
      .select('id')
      .eq('parent_id', folderId)
      .limit(1);

    if ((files && files.length > 0) || (subfolders && subfolders.length > 0)) {
      return res.status(400).json({ 
        error: 'Cannot delete folder that contains files or subfolders' 
      });
    }

    // Delete folder
    const { error: deleteError } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('owner_id', userId);

    if (deleteError) {
      console.error('Delete folder error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete folder' });
    }

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const renameFolder = async (req: AuthRequest, res: Response) => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check if folder exists and belongs to user
    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('owner_id', userId)
      .single();

    if (fetchError || !folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder with same name exists in the same parent
    const { data: existingFolder } = await supabase
      .from('folders')
      .select('id')
      .eq('name', name.trim())
      .eq('owner_id', userId)
      .eq('parent_id', folder.parent_id)
      .neq('id', folderId)
      .single();

    if (existingFolder) {
      return res.status(409).json({ error: 'Folder with this name already exists' });
    }

    // Update folder name
    const { data: updatedFolder, error: updateError } = await supabase
      .from('folders')
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Rename folder error:', updateError);
      return res.status(500).json({ error: 'Failed to rename folder' });
    }

    res.json({
      message: 'Folder renamed successfully',
      folder: updatedFolder
    });
  } catch (error) {
    console.error('Rename folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};