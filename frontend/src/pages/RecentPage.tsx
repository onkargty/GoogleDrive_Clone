import React from 'react';
import Layout from '../components/Layout';
import { Clock, FileText } from 'lucide-react';

const RecentPage: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Clock className="h-16 w-16 text-gray-300" />
              <FileText className="h-8 w-8 text-gray-300 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent files</h3>
          <p className="text-gray-500">Files you've recently viewed will appear here</p>
        </div>
      </div>
    </Layout>
  );
};

export default RecentPage;