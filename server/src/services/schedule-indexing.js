

module.exports = ({ strapi }) => ({
    async addFullSiteIndexingTask () {
        const data = await strapi.documents('plugin::elasticsearch.task').create({
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
        const data = await strapi.documents('plugin::elasticsearch.task').create({
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
        const data = await strapi.documents('plugin::elasticsearch.task').create({
            data : {
                item_document_id: recordId, 
                collection_name: collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "add-to-index" 
            }
        });
        return data;
    },
    async removeItemFromIndex({collectionUid, recordId}) {
        const data = await strapi.documents('plugin::elasticsearch.task').create({
            data : {
                item_document_id: recordId, 
                collection_name: collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "remove-from-index"
            }
        });
    },
    async getItemsPendingToBeIndexed(){
        const entries = await strapi.documents('plugin::elasticsearch.task').findMany({
            filters: { indexing_status : 'to-be-done'},
         });
         return entries;     
    },
    async markIndexingTaskComplete (recId) {
        await strapi.documents('plugin::elasticsearch.task').update({
            documentId: recId,
            data : {
                'indexing_status' : 'done'
            }
        });
    },
    async markIndexingTaskCompleteByItemDocumentId (recId) {
        const itemsToUpdate = await strapi.documents('plugin::elasticsearch.task').findMany({
            filters: {
                item_document_id : recId,
                indexing_status : 'to-be-done'
            }
        });
        if (itemsToUpdate.length > 0) {
            for (let k = 0; k<itemsToUpdate.length; k++) {
                await strapi.documents('plugin::elasticsearch.task').update({
                    documentId: itemsToUpdate[k].documentId,
                    data : {
                        'indexing_status' : 'done'
                    }
                });
            }
        }
    }
    
    

});