

const register = ({ strapi }) => {
  strapi.documents.use(async (context, next) => {
    const result = await next();
    const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing;
    if (['create', 'update', 'delete', 'publish', 'unpublish'].includes(context.action)
    && strapi.elasticsearch.collections.includes(context.uid)) {
      console.log('Document services context : ', context.action, ' ', context.uid, ' ', context.params.documentId);
      if (context.contentType.options.draftAndPublish === true) {
        //publish, unpublish
        if (context.action === 'publish') {
          console.log('Doing addItemToIndex');
          await scheduleIndexingService.addItemToIndex({
            collectionUid: context.uid,
            recordId: context.params.documentId
          });           
        }
        else if (context.action === 'unpublish') {
          console.log('Doing removeItemFromIndex');
          await scheduleIndexingService.removeItemFromIndex({
            collectionUid: context.uid,
            recordId: context.params.documentId
          });           
        } 
      }
      else {
        if (['create', 'update'].includes(context.action)) {
          console.log('Doing addItemToIndex');
          await scheduleIndexingService.addItemToIndex({
            collectionUid: context.uid,
            recordId: context.params.documentId
          }); 
        }
      }
      if (context.action === 'delete') {
        console.log('Doing removeItemFromIndex');
        await scheduleIndexingService.removeItemFromIndex({
          collectionUid: context.uid,
          recordId: context.params.documentId
        }); 
      }
    } 
  return result;
  });
};

export default register;
