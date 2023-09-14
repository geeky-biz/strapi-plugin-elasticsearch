module.exports = {
    "kind": "collectionType",
    "collectionName": "indexing-log",
    "info": {
      "singularName": "indexing-log",
      "pluralName": "indexing-logs",
      "displayName": "Indexing Logs",
      "description": "Logged runs of the indexing cron job"
    },
    "options": {
      "draftAndPublish": false
    },
    "pluginOptions": {
      'content-manager': {
        visible: true,
      },
      'content-type-builder': {
        visible: false,
      }        
    },
    "attributes": {
      "status": {
        "type": "enumeration",
        "enum": [
          "pass",
          "fail"
        ],
        "required": true
      },
      "details": {
        "type": "text"
      }  
    }
  }
  