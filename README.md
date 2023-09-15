# Strapi plugin strapi-plugin-elasticsearch

A plugin to enable integrating Elasticsearch with Strapi CMS.

## Installation

via npm:

```
npm i @geeky-biz/strapi-plugin-elasticsearch
```

via yarn:

```
yarn add @geeky-biz/strapi-plugin-elasticsearch
```

## Plugin Configuration

Within your Strapi project's `config/plugin.js`, enable the plugin and provide the configuration details:

```
module.exports = {
    // ...
    'elasticsearch': {
      enabled: true,
      config: {
        indexingCronSchedule: "<cron schedule>",
        searchConnector: {
          host: "<hostname for Elasticsearch>",
          username: "<username for Elasticsearch>",
          password: "<password for Elasticsearch>",
          certificate: "<path to the certificate required to connect to Elasticsearch>"
        },
        indexAliasName: "<Alias name for the Elasticsearch index>"
      }  
    },
    // ...
  }
```

Example plugin configuration (with adequate `.env` variables set up):
```
module.exports = {
    // ...
    'elasticsearch': {
      enabled: true,
      config: {
        indexingCronSchedule: "00 23 * * *", //run daily at 11:00 PM
        searchConnector: {
          host: process.env.ELASTIC_HOST,
          username: process.env.ELASTIC_USERNAME,
          password: process.env.ELASTIC_PASSWORD,
          certificate: path.join(__dirname, process.env.ELASTIC_CERT_NAME)
        },
        indexAliasName: process.env.ELASTIC_ALIAS_NAME
      }  
    },
    // ...
  }
```
## Ensuring connection to Elasticsearch
When connected to Elasticsearch, the `Connected` field within the `Setup Information` screen shall display `true`.

![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/a0fe0d6c-95e9-4c3c-95e1-46209db113c7)

## Configuring collections & attributes to be indexed
The `Configure Collections` view displays the collections and the fields setup to be indexed.

![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/13ad3a24-02a6-4c86-8da2-e015ba9c18ea)

From this view, individual collection can be selected to modify configuration:

![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/bdc1d674-a74f-4534-9b48-ad0e0eebaeea)

## Configuring indexing for dynamic zone or component attributes
To enable indexing content for attributes of type `component` or `dynamiczone`, additional information needs to be provided via JSON in the following format:

```
{
  "subfields": [
        {
          "component": "<component name within schema.json>",
          "field": "<field name from within that component>"
        },
        {...},
        {...}
      ]
}
```
### Example 1:
If we have an attribute called `seo_details` of type `component` like the following within our collection `schema.json`:
```
    "seo_details": {
      "type": "component",
      "repeatable": false,
      "component": "metainfo.seo"
    },
```
And, if we seek to index the contents of the `meta_description` field belonging to the component `seo`, our `subfields` configuration should be:
```
{
  "subfields": [
        {
          "component": "metainfo.seo",
          "field": "meta_description"
        }
      ]
}
```
![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/df1f7dba-2aa1-410e-a567-1de73156a020)

### Example 2:
If we have an attribute called `sections` of type `dynamiczone` within our collection `schema.json`:
```
    "sections": {
      "type": "dynamiczone",
      "components": [
        "content.footer",
        "content.paragraph",
        "content.separator",
        "content.heading"
      ]
    },
...
```
And, if we seek to index the contents of the fields `title` for `content.heading` and `details` as well as `subtext` for `content.paragraph`, our `subfields` configuration should be:
```
{
  "subfields": [
        {
          "component": "content.paragraph",
          "field": "details"
        },
        {
          "component": "content.paragraph",
          "field": "subtext"
        },
        {
          "component": "content.heading",
          "field": "title"
        }
      ]
}
```
The subfields JSON also supports multiple level of nesting:
```
{
  "subfields": [
        {
          "component": "content.footer",
          "field": "footer_link",
          "subfields": [
            {
              "component": "content.link",
              "field": "display_text"
            }
          ]
        }
      ]
}
```
Note: Indexing of `relations` attributes isn't yet supported.

## Exporting and Importing indexing configuration
To enable backing up the indexing configuration or transferring it between various environments, these can be Exported / Imported from the `Configure Collections` view.

![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/6e099392-499e-4101-8f51-85b7eff8aa38)

## Scheduling Indexing
Once the collection attributes are configured for indexing, any changes to the respective collections & attributes is marked for indexing. The cron job (configured via `indexingCronSchedule`) makes actual indexing requests to the connected Elasticsearch instance. 

- `Trigger Indexing` triggers the cron job immediately to perform the pending indexing tasks without waiting for the next scheduled run.
- `Rebuild Indexing` completely rebuilds the index. It may be used if the Elasticsearch appears to be out of sync from the data within Strapi.

![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/71df02a9-8513-4a91-8e23-2b5f34495c20)

Whenever a collection is configured for indexing, it may already have data that needs to be indexed. To facilitate indexing of the past data, a collection can be scheduled for indexing in the next cron run from the `Configure Collections` view:

![image](https://github.com/geeky-biz/strapi-plugin-elasticsearch/assets/17068206/7f37453a-dc87-406a-8de0-0391018b7fb5)

## Searching
You may directly use the Elasticsearch search API or you may use the Search API exposed by the plugin (at `/api/strapi-plugin-elasticsearch/search`). The plugin search API is just a wrapper around the Elasticsearch search API that passes the query parameter to the Elasticsearch search API and returns the results coming from Elasticsearch:

For example, the below API call would result into the Elasticsearch search API being triggered with the query 
```
`/api/strapi-plugin-elasticsearch/search?query=query%5Bbool%5D%5Bshould%5D%5B0%5D%5Bmatch%5D%5Binformation%5D=atlanta`
```
would result into the Elasticsearch search API being triggered with query
```
query[bool][should][0][match][information]=atlanta
```
The plugin's API would return the response from the Elasticsearch search API.

## Bugs
For any bugs, please create an issue [here](https://github.com/geeky-biz/strapi-plugin-elasticsearch/issues).

## About
- This plugin is created by [Punit Sethi](https://punits.dev).
- I'm an independent developer working on Strapi migrations, customizations, configuration projects (see [here](https://punits.dev/strapi-customizations/)).
- For any Strapi implementation requirement, write to me at `punit@tezify.com`.
