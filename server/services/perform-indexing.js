
module.exports = ({ strapi }) => ({

    async rebuildIndex() {
        const helper = strapi.plugins['elasticsearch'].services.helper;
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface;
        const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing;
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing;
        const logIndexingService = strapi.plugins['elasticsearch'].services.logIndexing;

        try
        {
            console.log('strapi-plugin-elasticsearch : Request to rebuild the index received.')
            const oldIndexName = await helper.getCurrentIndexName();
            console.log('strapi-plugin-elasticsearch : Recording the previous index name : ', oldIndexName);
    
            //Step 1 : Create a new index
            const newIndexName = await helper.getIncrementedIndexName();
            await esInterface.createIndex(newIndexName);
            console.log('strapi-plugin-elasticsearch : Created new index with name : ', newIndexName);
            
    
            //Step 2 : Index all the stuff on this new index
            console.log('strapi-plugin-elasticsearch : Starting to index all data into the new index.');
            const item = await scheduleIndexingService.addFullSiteIndexingTask();
            
            if (item.id)
            {
                const cols = await configureIndexingService.getCollectionsConfiguredForIndexing();
                for (let r=0; r< cols.length; r++)
                    await this.indexCollection(cols[r], newIndexName);
                    
                await scheduleIndexingService.markIndexingTaskComplete(item.id);    
    
                console.log('strapi-plugin-elasticsearch : Indexing of data into the new index complete.');
                //Step 4 : Move the alias to this new index
                await esInterface.attachAliasToIndex(newIndexName);;
                console.log('strapi-plugin-elasticsearch : Attaching the newly created index to the alias.')
                //Step 3 : Update the search-indexing-name
                await helper.storeCurrentIndexName(newIndexName);
    
                console.log('strapi-plugin-elasticsearch : Deleting the previous index : ', oldIndexName);
                //Step 5 : Delete the previous index
                await esInterface.deleteIndex(oldIndexName)
                await logIndexingService.recordIndexingPass('Request to immediately re-index site-wide content completed successfully.');

                return true;
            }
            else
            {
                await logIndexingService.recordIndexingFail('An error was encountered while trying site-wide re-indexing of content.');
                return false;
            }      
        }
        catch(err)
        {
            console.log('strapi-plugin-elasticsearch : searchController : An error was encountered while re-indexing.')
            console.log(err);
            await logIndexingService.recordIndexingFail(err);
        }
    },
    async indexCollection(collectionName, indexName = null) {
        const helper = strapi.plugins['elasticsearch'].services.helper;
        const populateAttrib = helper.getPopulateAttribute({collectionName});
        const isCollectionDraftPublish = helper.isCollectionDraftPublish({collectionName});
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing;
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface;
        if (indexName === null)
            indexName = await helper.getCurrentIndexName();
        let entries = [];
        if (isCollectionDraftPublish)
        {
            entries = await strapi.entityService.findMany(collectionName, {
                sort: { createdAt: 'DESC' },
                populate: populateAttrib['populate'],
                filters: {
                    publishedAt: {
                        $notNull: true
                    }
                }
            });
        }
        else
        {
            entries = await strapi.entityService.findMany(collectionName, {
                sort: { createdAt: 'DESC' },
                populate: populateAttrib['populate'],
            });
        }
        if (entries)
        {
            for (let s=0; s<entries.length; s++)
            {
                const item = entries[s];
                const indexItemId = helper.getIndexItemId({collectionName: collectionName, itemId: item.id});    
                const collectionConfig = await configureIndexingService.getCollectionConfig({collectionName})
                const dataToIndex = await helper.extractDataToIndex({
                        collectionName, data: item, collectionConfig
                });
                await esInterface.indexDataToSpecificIndex({itemId : indexItemId, itemData: dataToIndex}, indexName);
            }   
        }       
        return true;
    },
    async indexPendingData() {
        const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing;
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing;
        const logIndexingService = strapi.plugins['elasticsearch'].services.logIndexing;
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface;
        const helper = strapi.plugins['elasticsearch'].services.helper;
        const recs = await scheduleIndexingService.getItemsPendingToBeIndexed();
        const fullSiteIndexing = recs.filter(r => r.full_site_indexing === true).length > 0
        if (fullSiteIndexing)
        {
            await this.rebuildIndex();
            for (let r=0; r< recs.length; r++)
                await scheduleIndexingService.markIndexingTaskComplete(recs[r].id);
        }
        else
        {
            try
            {
                for (let r=0; r< recs.length; r++)
                {
                    const col = recs[r].collection_name;
                    if (configureIndexingService.isCollectionConfiguredToBeIndexed(col))
                    {
                        //Indexing the individual item
                        if (recs[r].item_id)
                        {
                            if (recs[r].indexing_type !== 'remove-from-index')
                            {
                                const populateAttrib = helper.getPopulateAttribute({collectionName: col});     
                                const item = await strapi.entityService.findOne(col, recs[r].item_id, {
                                    populate: populateAttrib['populate']
                                });
                                const indexItemId = helper.getIndexItemId({collectionName: col, itemId: item.id});    
                                const collectionConfig = await configureIndexingService.getCollectionConfig({collectionName: col})
                                const dataToIndex = await helper.extractDataToIndex({
                                        collectionName: col, data: item, collectionConfig
                                });
                                await esInterface.indexData({itemId : indexItemId, itemData: dataToIndex});
                                await scheduleIndexingService.markIndexingTaskComplete(recs[r].id);    
                            }
                            else
                            {
                                const indexItemId = helper.getIndexItemId({collectionName: col, itemId: recs[r].item_id})
                                await esInterface.removeItemFromIndex({itemId : indexItemId});
                                await scheduleIndexingService.markIndexingTaskComplete(recs[r].id);    
                            }
                        }
                        else //index the entire collection
                        {
                            //PENDING : Index an entire collection
                            await this.indexCollection(col);
                            await scheduleIndexingService.markIndexingTaskComplete(recs[r].id);                      
                        }
                    }
                    else
                        await scheduleIndexingService.markIndexingTaskComplete(recs[r].id);
                }
                await logIndexingService.recordIndexingPass('Indexing of ' + String(recs.length) + ' records complete.');
            }
            catch(err)
            {
                await logIndexingService.recordIndexingFail('Indexing of records failed - ' + ' ' + String(err));
                console.log(err);
                return false;
            }
        }
        return true;
    },
});