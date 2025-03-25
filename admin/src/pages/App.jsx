import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import pluginId from '../pluginId';
import HomePage from './HomePage';
import ConfigureCollectionList from './ConfigureCollectionList';
import ConfigureCollection from './ConfigureCollection';
import ViewIndexingRunLog from './ViewIndexingRunLog';
const App = () => {
  console.log('pluginId', pluginId);
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="configure-collections" element={<ConfigureCollectionList />} exact />
      <Route path={`configure-collections/:collectionName`} element={<ConfigureCollection />} exact />
      <Route path={`view-indexing-logs`} element={<ViewIndexingRunLog />} />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};

export { App };
