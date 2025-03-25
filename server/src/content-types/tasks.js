module.exports = {
    "kind": "collectionType",
    "collectionName": "task",
    "info": {
      "singularName": "task",
      "pluralName": "tasks",
      "displayName": "Task",
      "description": "Search indexing tasks"
    },
    "options": {
      "draftAndPublish": false
    },
    "pluginOptions": {
        'content-manager': {
            visible: false,
          },
          'content-type-builder': {
            visible: false,
          }        
    },
    "attributes": {
      "collection_name": {
        "type": "string",
        "required": true
      },
      "item_document_id": {
        "type": "string"
      },
      "indexing_status": {
        "type": "enumeration",
        "enum": [
          "to-be-done",
          "done"
        ],
        "required": true,
        "default": "to-be-done"
      },
      "full_site_indexing": {
        "type": "boolean"
      },
      "indexing_type": {
        "type": "enumeration",
        "enum": [
          "add-to-index",
          "remove-from-index"
        ],
        "default": "add-to-index",
        "required": true
      }
    }
  }
  