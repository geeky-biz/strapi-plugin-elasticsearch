# Strapi plugin strapi-plugin-elasticsearch

A plugin to enable integrating Elasticsearch with Strapi CMS.

## Installation

```
npm i @geeky-biz/strapi-plugin-elasticsearch
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

<img width="1483" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/6643f00a-2cc5-4043-834b-abee1f7f5b43">

## Configuring collections & attributes to be indexed
The `Configure Collections` view displays the collections and the fields setup to be indexed.

<img width="1474" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/14b135fc-822a-4700-bdea-396ef57a0701">

From this view, individual collection can be selected to modify configuration:

<img width="1483" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/c42c95b0-bcef-4a14-beae-9cbec37431c1">

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

<img width="898" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/86589da7-ce8e-49a3-a351-a7259dfb2908">

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

<img width="1492" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/1a93c35a-47a1-442b-893d-bec22ab468e9">

## Scheduling Indexing
Once the collection attributes are configured for indexing, any changes to the respective collections & attributes is marked for indexing. The cron job (configured via `indexingCronSchedule`) makes actual indexing requests to the connected Elasticsearch instance. 

- `Trigger Indexing` triggers the cron job immediately to perform the pending indexing tasks without waiting for the next scheduled run.
- `Rebuild Indexing` completely rebuilds the index. It may be used if the Elasticsearch appears to be out of sync from the data within Strapi.

<img width="1495" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/987279fd-b3bb-494c-9746-b2339454d214">

Whenever a collection is configured for indexing, it may already have data that needs to be indexed. To facilitate indexing of the past data, a collection can be scheduled for indexing in the next cron run from the `Configure Collections` view:

<img width="1485" alt="image" src="https://github.com/geeky-biz/strapi-elasticsearch/assets/17068206/8d51d40c-78ba-4613-a602-0676607bdb6f">

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
