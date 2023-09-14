import { collectionName } from "../../../server/content-types/tasks";

export const apiGetContentConfig = '/strapi-plugin-elasticsearch/content-config/'
export const apiGetCollectionConfig = (collectionName) => '/strapi-plugin-elasticsearch/collection-config/' + collectionName
export const apiSaveCollectionConfig = (collectionName) => '/strapi-plugin-elasticsearch/collection-config/' + collectionName
export const apiGetElasticsearchSetupInfo = '/strapi-plugin-elasticsearch/setup-info';
export const apiFetchRecentIndexingRunLog = '/strapi-plugin-elasticsearch/indexing-run-log'
export const apiRequestReIndexing = '/strapi-plugin-elasticsearch/reindex'
export const apiRequestCollectionIndexing = (collectionName) => `/strapi-plugin-elasticsearch/collection-reindex/${collectionName}`
export const apiTriggerIndexing = '/strapi-plugin-elasticsearch/trigger-indexing/'

export const apiExportContentConfig = '/strapi-plugin-elasticsearch/export-content-config/'
export const apiImportContentConfig = '/strapi-plugin-elasticsearch/import-content-config/'

