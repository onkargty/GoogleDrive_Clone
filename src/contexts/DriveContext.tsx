@@ .. @@
   const [viewMode, setViewMode] = useState<ViewMode>('grid');
   const [sortBy, setSortBy] = useState<SortBy>('name');
   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
   const [searchQuery, setSearchQuery] = useState('');
   const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
   const [selectedItems, setSelectedItems] = useState<string[]>([]);

   const refreshData = useCallback(async () => {
     if (!user) return;

     try {
       setLoading(true);
       setError(null);
       
       // Fetch files
       let filesQuery = supabase
         .from('files')
         .select('*')
         .eq('owner_id', user.id);

       if (currentFolderId) {
         filesQuery = filesQuery.eq('folder_id', currentFolderId);
       } else {
         filesQuery = filesQuery.is('folder_id', null);
       }

       // Fetch folders
       let foldersQuery = supabase
         .from('folders')
         .select('*')
         .eq('owner_id', user.id);

       if (currentFolderId) {
         foldersQuery = foldersQuery.eq('parent_id', currentFolderId);
       } else {
         foldersQuery = foldersQuery.is('parent_id', null);
       }

       const [filesResponse, foldersResponse] = await Promise.all([
         filesQuery.order('created_at', { ascending: false }),
         foldersQuery.order('created_at', { ascending: false })
       ]);

       if (filesResponse.error) throw filesResponse.error;
       if (foldersResponse.error) throw foldersResponse.error;

       setFiles(filesResponse.data || []);
       setFolders(foldersResponse.data || []);
     } catch (err) {
       const message = err instanceof Error ? err.message : 'An error occurred';
       setError(message);
       toast.error(message);
     } finally {
       setLoading(false);
     }
   }, [user, currentFolderId]);