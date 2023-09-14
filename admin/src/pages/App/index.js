/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { AnErrorOccurred } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import ConfigureCollectionList from '../ConfigureCollectionList';
import ConfigureCollection from '../ConfigureCollection';
import ViewIndexingRunLog from '../ViewIndexingRunLog';
import Homepage from '../Homepage';
const App = () => {
  return (
      <Switch>
        <Route path={`/plugins/${pluginId}`} render={() => (<Redirect to={`/plugins/${pluginId}/home`} />)} exact />
        <Route path={`/plugins/${pluginId}/home`} component={Homepage} exact />
        <Route path={`/plugins/${pluginId}/configure-collections`} component={ConfigureCollectionList} exact />
        <Route path={`/plugins/${pluginId}/configure-collections/:collectionName`} component={ConfigureCollection} exact />
        <Route path={`/plugins/${pluginId}/view-indexing-logs`} component={ViewIndexingRunLog} />        
        <Route component={AnErrorOccurred} />
      </Switch>
  );
};

export default App;
