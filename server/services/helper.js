
///START : via https://raw.githubusercontent.com/Barelydead/strapi-plugin-populate-deep/main/server/helpers/index.js

const { isEmpty, merge } = require("lodash/fp");
const transformServiceProvider = require('./transform-content');

const getPluginStore = () => {
    return strapi.store({
      environment: '',
      type: 'plugin',
      name: 'elasticsearch',
    });
  }


const getModelPopulationAttributes = (model) => {
  if (model.uid === "plugin::upload.file") {
    const { related, ...attributes } = model.attributes;
    return attributes;
  }

  return model.attributes;
};

const getFullPopulateObject = (modelUid, maxDepth = 20, ignore) => {
  const skipCreatorFields = true;

  if (maxDepth <= 1) {
    return true;
  }
  if (modelUid === "admin::user" && skipCreatorFields) {
    return undefined;
  }

  const populate = {};
  const model = strapi.getModel(modelUid);
  if (ignore && !ignore.includes(model.collectionName)) ignore.push(model.collectionName)
  for (const [key, value] of Object.entries(
    getModelPopulationAttributes(model)
  )) {
    if (ignore?.includes(key)) continue
    if (value) {
      if (value.type === "component") {
        populate[key] = getFullPopulateObject(value.component, maxDepth - 1);
      } else if (value.type === "dynamiczone") {
        const dynamicPopulate = value.components.reduce((prev, cur) => {
          const curPopulate = getFullPopulateObject(cur, maxDepth - 1);
          return curPopulate === true ? prev : merge(prev, curPopulate);
        }, {});
        populate[key] = isEmpty(dynamicPopulate) ? true : dynamicPopulate;
      } else if (value.type === "relation") {
        const relationPopulate = getFullPopulateObject(
          value.target,
          (key === 'localizations') && maxDepth > 2 ? 1 : maxDepth - 1,
          ignore
        );
        if (relationPopulate) {
          populate[key] = relationPopulate;
        }
      } else if (value.type === "media") {
        populate[key] = true;
      }
    }
  }
  return isEmpty(populate) ? true : { populate };
};

///END : via https://raw.githubusercontent.com/Barelydead/strapi-plugin-populate-deep/main/server/helpers/index.js
  

/*
//Example config to cover extraction cases
            collectionConfig[collectionName] = {
                'major' : {index: true},
                'sections' : { index: true, searchFieldName: 'information',
                    'subfields' : [
                        { 'component' : 'try.paragraph',
                            'field' : 'Text'}, 
                        { 'component' : 'try.paragraph',
                            'field' : 'Heading'},
                        { 'component' : 'try.footer',
                            'field' : 'footer_link',
                            'subfields' :[ {
                                'component' : 'try.link',
                                'field' : 'display_text'
                            }] 
                        }] },
                'seo_details' : {
                    index: true, searchFieldName: 'seo',
                    'subfields' : [
                        {
                            'component' : 'try.seo',
                            'field' : 'meta_description'
                        }
                    ]
                },
                'changelog' : {
                    index: true, searchFieldName: 'breakdown',
                    'subfields' : [
                        {
                            'component' : 'try.revision',
                            'field' : 'summary'
                        }
                    ]
                }
            }
*/            
function extractSubfieldData({config, data }) {
    let returnData = '';
    if (Array.isArray(data))
    {
        const dynDataItems = data;
        for (let r=0; r< dynDataItems.length; r++)
        {
            const extractItem = dynDataItems[r];
            for (let s=0; s<config.length; s++)
            {
                const conf = config[s];
                if (Object.keys(extractItem).includes('__component'))
                {
                    if (conf.component === extractItem.__component &&
                        !Object.keys(conf).includes('subfields') &&
                        typeof extractItem[conf['field']] !== "undefined" &&
                        extractItem[conf['field']])
                    {
                        let val = extractItem[conf['field']]
                        if (Object.keys(conf).includes('transform')
                            && conf['transform'] === 'markdown')
                            val = transformServiceProvider.transform({content: val, from: 'markdown'});
                        returnData = returnData + '\n' + val;
                    }
                    else if (conf.component === extractItem.__component &&
                        Object.keys(conf).includes('subfields'))
                    {
                        returnData = returnData + '\n' + extractSubfieldData({
                            config: conf['subfields'], data: extractItem[conf['field']]}); 
                    }
                }
                else
                {
                    if (!Object.keys(conf).includes('subfields') &&
                    typeof extractItem[conf['field']] !== "undefined" &&
                    extractItem[conf['field']])
                    {
                        let val = extractItem[conf['field']]
                        if (Object.keys(conf).includes('transform')
                            && conf['transform'] === 'markdown')
                            val = transformServiceProvider.transform({content: val, from: 'markdown'});
                        returnData = returnData + '\n' + val;
                    }
                    else if (Object.keys(conf).includes('subfields'))
                    {
                        returnData = returnData + '\n' + extractSubfieldData({
                            config: conf['subfields'], data: extractItem[conf['field']]}); 
                    }
                }
            }
        }
    }
    else //for single component as a field
    {
        for (let s=0; s<config.length; s++)
        {
            const conf = config[s];
            if (!Object.keys(conf).includes('subfields') &&
            typeof data[conf['field']] !== "undefined" &&
            data[conf['field']])
                returnData = returnData + '\n' + data[conf['field']]
            else if (Object.keys(conf).includes('subfields'))
            {
                returnData = returnData + '\n' + extractSubfieldData({
                    config: conf['subfields'], data: data[conf['field']]}); 
            }
        }
    }
    return returnData;    
}

module.exports = ({ strapi }) => ({
    async getElasticsearchInfo() {
        const configureService = strapi.plugins['elasticsearch'].services.configureIndexing;
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface;
        const pluginConfig = await strapi.config.get('plugin.elasticsearch');
        const connected = pluginConfig.searchConnector && pluginConfig.searchConnector.host
         ? await esInterface.checkESConnection() : false;

        return {
            indexingCronSchedule : pluginConfig.indexingCronSchedule || "Not configured",
            elasticHost : pluginConfig.searchConnector ? 
                            pluginConfig.searchConnector.host || "Not configured" : "Not configured",
            elasticUserName : pluginConfig.searchConnector ? 
                            pluginConfig.searchConnector.username || "Not configured" : "Not configured",
            elasticCertificate : pluginConfig.searchConnector ? 
            pluginConfig.searchConnector.certificate || "Not configured" : "Not configured",
            elasticIndexAlias : pluginConfig.indexAliasName || "Not configured",
            connected : connected,
            initialized : configureService.isInitialized()
        }
    },
    isCollectionDraftPublish({collectionName}) {
        const model = strapi.getModel(collectionName);
        return model.attributes.publishedAt ? true : false
    },
    getPopulateAttribute({collectionName}) {
        //TODO : We currently have set populate to upto 4 levels, should
        //this be configurable or a different default value?
        return getFullPopulateObject(collectionName, 4, []);
    },
    getIndexItemId ({collectionName, itemId}) {
        return collectionName+'::' + itemId;
    },
    async getCurrentIndexName () {
        const pluginStore = getPluginStore();
        const settings = await pluginStore.get({ key: 'configsettings' });
        let indexName = 'strapi-plugin-elasticsearch-index_000001';
        if (settings)
        {
          const objSettings = JSON.parse(settings);
          if (Object.keys(objSettings).includes('indexConfig'))
          {
            const idxConfig = objSettings['indexConfig'];
            indexName = idxConfig['name'];
          }
        }
        return indexName;
    },
    async getIncrementedIndexName () {
        const currentIndexName = await this.getCurrentIndexName();
        const number = parseInt(currentIndexName.split('index_')[1]);
        return 'strapi-plugin-elasticsearch-index_' + String(number+1).padStart(6,'0');
    },
    async storeCurrentIndexName (indexName) {
        const pluginStore = getPluginStore();
        const settings = await pluginStore.get({ key: 'configsettings' });
        if (settings)
        {
            const objSettings = JSON.parse(settings);
            objSettings['indexConfig'] = {'name' : indexName};
            await pluginStore.set({ key: 'configsettings', value : JSON.stringify(objSettings)});      
        }
        else
        {
            const newSettings =  JSON.stringify({'indexConfig' : {'name' : indexName}})
            await pluginStore.set({ key: 'configsettings', value : newSettings});      
        }
    },
    modifySubfieldsConfigForExtractor(collectionConfig) {
        const collectionName = Object.keys(collectionConfig)[0];
        const attributes = Object.keys(collectionConfig[collectionName]);
        for (let r=0; r< attributes.length; r++)
        {
            const attr = attributes[r];
            const attribFields = Object.keys(collectionConfig[collectionName][attr]);
            if (attribFields.includes('subfields'))
            {
                const subfielddata = collectionConfig[collectionName][attr]['subfields'];
                if (subfielddata.length > 0)
                {
                    try {
                        const subfieldjson = JSON.parse(subfielddata)
                        if (Object.keys(subfieldjson).includes('subfields'))
                            collectionConfig[collectionName][attr]['subfields'] = subfieldjson['subfields']
                    }
                    catch(err)
                    {
                        continue;
                    }
                }
            }
        }
        return collectionConfig;
    },
    extractDataToIndex({collectionName, data, collectionConfig}) {
        collectionConfig = this.modifySubfieldsConfigForExtractor(collectionConfig);
        const fti = Object.keys(collectionConfig[collectionName]);
        const document = {}
        for (let k = 0; k < fti.length; k++)
        {
            const fieldConfig = collectionConfig[collectionName][fti[k]];
            if (fieldConfig.index)
            {
                let val = null;
                if (Object.keys(fieldConfig).includes('subfields'))
                {
                    val = extractSubfieldData({config: fieldConfig['subfields'], data: data[fti[k]]})
                    val = val ? val.trim() : val
                }
                else
                {
                    val = data[fti[k]];
                    if (Object.keys(fieldConfig).includes('transform') && 
                        fieldConfig['transform'] === 'markdown')
                        val = transformServiceProvider.transform({content: val, from: 'markdown'});
                }
                    
                if (Object.keys(fieldConfig).includes('searchFieldName'))
                    document[fieldConfig['searchFieldName']] = val;
                else
                    document[fti[k]] = val;
            }
        }
        return document;
    }    
});