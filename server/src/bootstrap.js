'use strict';

module.exports = async ({ strapi }) => {
    const pluginConfig = await strapi.config.get('plugin::elasticsearch');
    const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing;
    const esInterface = strapi.plugins['elasticsearch'].services.esInterface;
    const indexer = strapi.plugins['elasticsearch'].services.indexer;
    const helper = strapi.plugins['elasticsearch'].services.helper; 
    try
    {
      await configureIndexingService.initializeStrapiElasticsearch();
    
      if (!Object.keys(pluginConfig).includes('indexingCronSchedule'))
        console.warn("The plugin strapi-plugin-elasticsearch is enabled but the indexingCronSchedule is not configured.");
      else if (!Object.keys(pluginConfig).includes('searchConnector'))
        console.warn("The plugin strapi-plugin-elasticsearch is enabled but the searchConnector is not configured.");
      else
      {
        const connector = pluginConfig['searchConnector'];
        await esInterface.initializeSearchEngine({host : connector.host, uname: connector.username, 
              password: connector.password, cert: connector.certificate});
        strapi.cron.add({
          elasticsearchIndexing: {
            task: async ({ strapi }) => {
              await indexer.indexPendingData();
            },
            options: {
              rule: pluginConfig['indexingCronSchedule'],
            },
          },
        });   
        
        if (await esInterface.checkESConnection())
        {
          //Attach the alias to the current index:
          const idxName = await helper.getCurrentIndexName();
          await esInterface.attachAliasToIndex(idxName);
        }
          
      }  
      configureIndexingService.markInitialized(); 
    }
    catch(err) {
      console.error('An error was encountered while initializing the strapi-plugin-elasticsearch plugin.')
      console.error(err);
    }  
};
