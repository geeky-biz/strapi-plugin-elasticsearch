module.exports = {
    // accessible only from admin UI
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/indexing-run-log',
        handler: 'logIndexing.fetchRecentRunsLog',
        config: { policies: [] },
      }
    ],
  };