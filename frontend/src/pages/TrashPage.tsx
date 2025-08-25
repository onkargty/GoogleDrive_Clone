import React from 'react';
import Layout from '../components/Layout';
import { Trash2, RotateCcw } from 'lucide-react';

const TrashPage: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trash2 className="h-16 w-16 text-gray-300" />
              <RotateCcw className="h-8 w-8 text-gray-300 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is empty</h3>
          <p className="text-gray-500">Items you delete will appear here</p>
        </div>
      </div>
    </Layout>
  );
};

export default TrashPage;