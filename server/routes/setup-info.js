module.exports = {
    // accessible only from admin UI
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/setup-info',
        handler: 'setupInfo.getElasticsearchInfo',
        config: { policies: [] },
      }      
    ],
  };