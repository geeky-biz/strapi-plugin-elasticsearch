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
      }
    ],
  };