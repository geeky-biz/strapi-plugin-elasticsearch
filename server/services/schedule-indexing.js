

module.exports = ({ strapi }) => ({
    async addFullSiteIndexingTask () {
        const data = await strapi.entityService.create('plugin::elasticsearch.task', {
            data : {
                collection_name: '',
                indexing_status: 'to-be-done',
                full_site_indexing: true,
                indexing_type: "add-to-index" 
            }
        });
        return data;
    },
    async addCollectionToIndex({collectionUid}) {
        const data = await strapi.entityService.create('plugin::elasticsearch.task', {
            data : {
                collection_name: collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "add-to-index" 
            }
        });
        return data;
    },
    async addItemToIndex({collectionUid, recordId}) {
        const data = await strapi.entityService.create('plugin::elasticsearch.task', {
            data : {
                item_id: recordId, 
                collection_name: collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "add-to-index" 
            }
        });
        return data;
    },
    async removeItemFromIndex({collectionUid, recordId}) {
        const data = await strapi.entityService.create('plugin::elasticsearch.task', {
            data : {
                item_id: recordId, 
                collection_name: collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "remove-from-index"
            }
        });
    },
    async getItemsPendingToBeIndexed(){
        const entries = await strapi.entityService.findMany('plugin::elasticsearch.task', {
            filters: { indexing_status : 'to-be-done'},
         });
         return entries;     
    },
    async markIndexingTaskComplete (recId) {
        const entries = await strapi.entityService.update('plugin::elasticsearch.task', recId, {
            data : {
                'indexing_status' : 'done'
            }
        }); 
    }
    
    

});