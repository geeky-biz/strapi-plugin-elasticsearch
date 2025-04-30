module.exports = {
    // accessible only from admin UI
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/search',
        handler: 'performSearch.search',
        config: { 
            policies: []
        },
      },
      {
        method: 'GET',
        path: '/reindex',
        handler: 'performIndexing.rebuildIndex',
        config: { policies: [] },
      },
      {
        method: 'GET',
        path: '/collection-reindex/:collectionname',
        handler: 'performIndexing.indexCollection',
        config: { policies: [] },
      },
      {
        method: 'GET',
        path: '/trigger-indexing/',
        handler: 'performIndexing.triggerIndexingTask',
        config: { policies: [] },
      },
    ],
  };
