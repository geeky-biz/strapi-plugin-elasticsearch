/*
 *
 * HomePage
 *
 */

import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axiosInstance  from '../../utils/axiosInstance';
import  { SubNavigation } from '../../components/SubNavigation';;
import { Box, Flex } from '@strapi/design-system';
import { ToggleInput } from '@strapi/design-system';
import { Link, useTracking } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import { apiGetCollectionConfig, apiSaveCollectionConfig } from "../../utils/apiUrls";
import { Alert } from '@strapi/design-system';
import { Button } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { Typography } from '@strapi/design-system';
import { Loader, Textarea, TextInput } from '@strapi/design-system';
import {LoadingIndicatorPage, useNotification} from '@strapi/helper-plugin';

const loadConfigForCollection = (collectionName) => {
    return axiosInstance.get(apiGetCollectionConfig(collectionName))
        .then((resp) => resp.data);
  } 

const saveConfigForCollection = (collectionName, data) => {
    return axiosInstance.post(apiSaveCollectionConfig(collectionName), {
        data
    })
}

const ConfigureField = ({config, index, setFieldConfig}) => {

    const validateSubfieldsConfig = (conf) => {
        if (conf && conf.length > 0)
        {
          try {
            JSON.parse(conf);
            return true;
          } catch (e) {
            return false;
          }
        }
        else
            return true;
    }
    
    const updateIndex = (checked) => {
        setFieldConfig({index, config: {...config, index: checked}})
    }

    const updateSubfieldConfig = (subfields) => {
        const subfieldsConfigValid = validateSubfieldsConfig(subfields);
        setFieldConfig({index, config: {...config, subfields, subfieldsConfigValid}})
    }
 
    const updateMappedFieldName = (mappedName) => {
        setFieldConfig({index, config: {...config, searchFieldName: mappedName}})
    }

    return (
        <Box background="neutral100" borderColor="neutral200" hasRadius index={index} 
        padding={4}>
            <Box paddingTop={2} paddingBottom={2}>
            <Typography fontWeight="bold" textColor="neutral600">{config.name}</Typography>
            </Box>
            <Box paddingTop={2} paddingBottom={2}>
            <ToggleInput label="Index" onLabel="Yes" offLabel="No"
                checked={config.index} onChange={(e) => updateIndex(e.target.checked)} />
            </Box>
            <Box width="50%"  paddingTop={2} paddingBottom={2}>
                <TextInput label="Maps to search field" placeholder="Enter field name" name="Search field" onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} />
            </Box>
            {
                config.index && config.type && config.type === "dynamiczone" ? (
                    <Box paddingTop={2} paddingBottom={2}>
                    <Textarea 
                    label="Dynamic zone fields to index" 
                    error={config.subfieldsConfigValid === false ? 'Invalid indexing configuration' : undefined}
                    onChange={e => updateSubfieldConfig(e.target.value)}
                    >{config.subfields || ""}</Textarea>
                    </Box>
                ) : null
            }
            {
                config.index && config.type && config.type === "component" ? (
                    <Box paddingTop={2} paddingBottom={2}>
                    <Textarea 
                    label="Component fields to index" 
                    error={config.subfieldsConfigValid === false ? 'Invalid indexing configuration' : undefined}
                    onChange={e => updateSubfieldConfig(e.target.value)}
                    >{config.subfields || ""}</Textarea>
                    </Box>
                ) : null
            }
        </Box>        
    )
}
  
const ConfigureCollection = () => {
    const [isInProgress, setIsInProgress] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collectionConfig, setCollectionConfig] = useState(null);

    const params = useParams();
    const toggleNotification = useNotification();
    const updateCollectionsConfig = ({index, config}) => {
        setCollectionConfig({
            collectionName: collectionConfig.collectionName,
            attributes: collectionConfig.attributes.map((e, idx) => index === idx ? config : e)
        });
    }

    const saveCollectionConfig = () => {
        if (collectionConfig && collectionConfig.collectionName)
        {
            const data = {}
            data[collectionConfig.collectionName] = {}
            for (let k=0; k<collectionConfig.attributes.length; k++)
            {
                const {name, ...attribs} = collectionConfig.attributes[k]
                data[collectionConfig.collectionName][name] = attribs
            }
            setIsInProgress(true);
            saveConfigForCollection(collectionConfig.collectionName, data)
            .then((resp) => {
                toggleNotification({
                    type: "success", message: "The collection configuration is saved.", timeout: 5000
                });
            })
            .catch((err) => {
                toggleNotification({
                    type: "warning", message: err.message || "An error was encountered.", timeout: 5000
                });
                console.log(err);
            })
            .finally(() => setIsInProgress(false));
        }
    }

    useEffect(() => {
        if (params && params.collectionName)
            setSelectedCollection(params.collectionName)
    }, [params]);

    useEffect(() => {
        if (selectedCollection)
        {
            loadConfigForCollection(selectedCollection)
            .then((resp) => {
                if (Object.keys(resp).length === 0)
                {
                    toggleNotification({
                        type: "warning", message: 'No collection with the selected name exists.', timeout: 5000
                    });
                }
                else
                {
                    const collectionName = Object.keys(resp)[0];
                    const attributeNames = Object.keys(resp[collectionName]);
                    const attributes = [];
                    for (let s = 0; s<attributeNames.length; s++)
                        attributes.push({name: attributeNames[s], ...resp[collectionName][attributeNames[s]]})
                    const item = {collectionName, attributes};
                    setCollectionConfig(item);
                }
            })
            .catch((err) => {
                toggleNotification({
                    type: "warning", message: err.message || "An error was encountered.", timeout: 5000
                });
                console.log(err);
            });    
        }
    }, [selectedCollection]);

  if (collectionConfig === null)
    return <LoadingIndicatorPage />;
  else
  return (
    <Flex alignItems="stretch" gap={4}>
        <SubNavigation />
        <Box padding={8} background="neutral100" width="100%">
                <Box paddingBottom={4}>
                    <Link startIcon={<ArrowLeft />} to="/plugins/strapi-plugin-elasticsearch/configure-collections/">
                        Back
                    </Link>
                </Box>
                {
                    selectedCollection && (
                        <Box paddingBottom={4}>
                            <Typography variant="alpha">{selectedCollection}</Typography>
                        </Box>
                    )
                }
                {
                    collectionConfig && (
                        <>
                        <Flex alignItems="stretch" gap={4} width="100%">
                            <Box padding={8} background="neutral0" width="100%">
                                <Box paddingBottom={2}>
                                    <Typography variant="beta">Attributes</Typography>
                                    {
                                        collectionConfig.attributes.map((a, idx) => {
                                            return <Box paddingTop={4} paddingBottom={4}><ConfigureField index={idx} config={a} 
                                            setFieldConfig={updateCollectionsConfig} /></Box>
                                        })
                                    }
                                </Box>
                            </Box>
                        </Flex>
                        <Box paddingTop={4}>
                            <Button loading={isInProgress} variant="default" onClick={saveCollectionConfig} >Save Configuration Changes</Button>
                        </Box>
                        </>
                    ) 
                }
        </Box>
    </Flex>
  );
};

export default ConfigureCollection;
