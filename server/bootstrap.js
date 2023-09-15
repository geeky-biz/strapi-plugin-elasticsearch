'use strict';

module.exports = async ({ strapi }) => {
  const pluginConfigObj = await strapi.config.get('plugin.elasticsearch');
  if (pluginConfigObj && pluginConfigObj.enabled) 
  {
    const pluginConfig = Object.keys(pluginConfigObj).includes('config') ? pluginConfigObj['config'] : {}
    const configureIndexingService = strapi.plugins['strapi-plugin-elasticsearch'].services.configureIndexing;
    const scheduleIndexingService = strapi.plugins['strapi-plugin-elasticsearch'].services.scheduleIndexing;
    const esInterface = strapi.plugins['strapi-plugin-elasticsearch'].services.esInterface;
    const indexer = strapi.plugins['strapi-plugin-elasticsearch'].services.indexer;
    const helper = strapi.plugins['strapi-plugin-elasticsearch'].services.helper; 
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
  
      strapi.db.lifecycles.subscribe(async (event) => {
        if (event.action === 'afterCreate' || event.action === 'afterUpdate') {
          if (strapi.elasticsearch.collections.includes(event.model.uid))
          {
            //collection without draft-publish
            if (typeof event.model.attributes.publishedAt === "undefined")
            {
              await scheduleIndexingService.addItemToIndex({
                collectionUid: event.model.uid,
                recordId: event.result.id
              });  
            }
            else if (event.model.attributes.publishedAt)
            {
              if (event.result.publishedAt)
              {
                await scheduleIndexingService.addItemToIndex({
                  collectionUid: event.model.uid,
                  recordId: event.result.id
                });    
              }
              else
              {
                //unpublish
                await scheduleIndexingService.removeItemFromIndex({
                  collectionUid: event.model.uid,
                  recordId: event.result.id
                });    
              }
            }
          }
        }
        //bulk publish-unpublish from list view
        if (event.action === 'afterCreateMany' || event.action === 'afterUpdateMany') {
          if (strapi.elasticsearch.collections.includes(event.model.uid))
          {
            if (Object.keys(event.params.where.id).includes('$in'))
            {
              const updatedItemIds = event.params.where.id['$in']
              //bulk unpublish
              if (typeof event.params.data.publishedAt === "undefined" || 
                event.params.data.publishedAt === null)
                {
                  for (let k = 0; k< updatedItemIds.length; k++)
                  {
                    await scheduleIndexingService.removeItemFromIndex({
                      collectionUid: event.model.uid,
                      recordId: updatedItemIds[k]
                    });            
                  }    
                }
              else
              {
                for (let k = 0; k< updatedItemIds.length; k++)
                {
                  await scheduleIndexingService.addItemToIndex({
                    collectionUid: event.model.uid,
                    recordId: updatedItemIds[k]
                  });   
                }
              }
            }
          }
        }    
        if (event.action === 'afterDelete') {
          if (strapi.elasticsearch.collections.includes(event.model.uid))
          {
            await scheduleIndexingService.removeItemFromIndex({
              collectionUid: event.model.uid,
              recordId: event.result.id
            });  
          }
        }
        if (event.action === 'afterDeleteMany') {
          if (strapi.elasticsearch.collections.includes(event.model.uid))
          {
            if (Object.keys(event.params.where).includes('$and') &&
            Array.isArray(event.params.where['$and']) &&
            Object.keys(event.params.where['$and'][0]).includes('id') && 
            Object.keys(event.params.where['$and'][0]['id']).includes('$in'))
            {
              const deletedItemIds = event.params.where['$and'][0]['id']['$in']
              for (let k = 0; k< deletedItemIds.length; k++)
              {
                await scheduleIndexingService.removeItemFromIndex({
                  collectionUid: event.model.uid,
                  recordId: deletedItemIds[k]
                });            
              }
            }        
          }
        }
      });   
      configureIndexingService.markInitialized(); 
    }
    catch(err) {
      console.error('An error was encountered while initializing the strapi-plugin-elasticsearch plugin.')
      console.error(err);
    }  
    
  }
};
