import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DriveContent from '../components/DriveContent';

const DrivePage: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DriveContent />} />
        <Route path="/folder/:folderId" element={<DriveContent />} />
      </Routes>
    </Layout>
  );
};

export default DrivePage;