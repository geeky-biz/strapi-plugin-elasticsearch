module.exports = {
    // accessible only from admin UI
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/content-config',
        handler: 'configureIndexing.getContentConfig',
        config: { policies: [] },
      },
      {
        method: 'GET',
        path: '/collection-config/:collectionname',
        handler: 'configureIndexing.getCollectionConfig',
        config: { policies: [] },
      },
      {
        method: 'POST',
        path: '/collection-config/:collectionname',
        handler: 'configureIndexing.saveCollectionConfig',
        config: { policies: [] },
      },
      {
        method: 'POST',
        path: '/content-config',
        handler: 'configureIndexing.setContentConfig',
        config: { policies: [] },
      },
      {
        method: 'GET',
        path: '/export-content-config',
        handler: 'configureIndexing.exportContentConfig',
        config: { policies: [] },
      },
      {
        method: 'POST',
        path: '/import-content-config',
        handler: 'configureIndexing.importContentConfig',
        config: { policies: [] },
      },
    ],
  };