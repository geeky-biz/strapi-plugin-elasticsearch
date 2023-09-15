/*
 *
 * HomePage
 *
 */

import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import  { SubNavigation } from '../../components/SubNavigation';;
import { Box, Flex } from '@strapi/design-system';
import { useEffect } from 'react';
import { Loader } from '@strapi/design-system';
import { apiGetContentConfig, apiRequestCollectionIndexing,
        apiImportContentConfig, apiExportContentConfig } from "../../utils/apiUrls";
import axiosInstance  from '../../utils/axiosInstance';
import { Alert } from '@strapi/design-system';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { Pencil, Server } from '@strapi/icons';
import { IconButton } from '@strapi/design-system';
import { useHistory } from "react-router-dom";
import { Button } from '@strapi/design-system';
import { ModalLayout, ModalBody, ModalHeader, ModalFooter } from '@strapi/design-system';
import { Textarea, TwoColsLayout, Divider } from '@strapi/design-system';
import {LoadingIndicatorPage, useNotification} from '@strapi/helper-plugin';

const exportContentConfig = () => {
  return axiosInstance.get(apiGetContentConfig,
    {
      responseType: 'blob'
    })
    .then((response) => {
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', 'strapi-plugin-elasticsearch-contentconfig.json'); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
  });
}

const importContentConfig = (conf) => {
  return axiosInstance.post(apiImportContentConfig, {
    data : conf
  });
}

const loadContentConfig = () => {
  return axiosInstance.get(apiGetContentConfig)
      .then((resp) => resp.data);
} 

const scheduleCollectionIndexing = (collectionName) => {
  return axiosInstance.get(apiRequestCollectionIndexing(collectionName))
    .then(console.log);
}

const Configure = () => {
  const [isInProgress, setIsInProgress] = useState(false);
  const [displayImportModal, setDisplayImportModal] = useState(false);
  const [isEnteredJsonValid, setIsEnteredJsonValid] = useState(true);
  const [importJson, setImportJson] = useState(null);

  const [config, setConfig] = useState(null);
  const history = useHistory();
  const toggleNotification = useNotification();

  const performImport = () => {
    const conf = importJson
    console.log(conf && conf.length > 0)
    if (conf && conf.length > 0) {
      setIsInProgress(true);
      importContentConfig(conf)
      .then(() => {
        toggleNotification({
          type: "success", message: "Collections configuration imported. Please refresh this view.", timeout: 5000
        });
      })
      .catch((err) => {
        toggleNotification({
          type: "warning", message: "Importing collections configuration failed. An error was encountered.", timeout: 5000
        });
        console.log(err);
      })
      .finally(() => setIsInProgress(false));
    }
  }
  const performExport = () => {
    setIsInProgress(true);
    exportContentConfig()
    .then(() => {
      toggleNotification({
        type: "success", message: "Collections configuration exported.", timeout: 5000
      });
    })
    .catch((err) => {
      toggleNotification({
        type: "warning", message: "Exporting collections configuration failed. An error was encountered.", timeout: 5000
      });
      console.log(err);
    })
    .finally(() => setIsInProgress(false));
  }

  useEffect(() => {
    if (importJson && importJson.length > 0)
    {
      try {
        JSON.parse(importJson);
        setIsEnteredJsonValid(true);
      } catch (e) {
          setIsEnteredJsonValid(false);
      }
    }
  }, [importJson]);

  useEffect(() => {
    setIsInProgress(true);
    loadContentConfig()
    .then((resp) => {
      const displayConfig = [];
      for (let r=0; r < Object.keys(resp).length; r++)
      {
        const item = {collectionName: Object.keys(resp)[r], indexed: [], notIndexed: []};
        const collectionName = item.collectionName;
        for (let k=0; k < Object.keys(resp[collectionName]).length; k++)
        {
          const attribs = resp[collectionName];
          for (let s=0; s < Object.keys(attribs).length; s++)
          {
            const attrName = Object.keys(attribs)[s]
            const attr = attribs[attrName]
            if (attr.index === false && !item.notIndexed.includes(attrName))
              item.notIndexed.push(attrName)
            else if (attr.index && !item.indexed.includes(attrName))
              item.indexed.push(attrName)
          }
        }
        displayConfig.push(item);
      }
      setConfig(displayConfig);
    })
    .catch((err) => {
      toggleNotification({
        type: "warning", message: "An error was encountered while fetching the configuration.", timeout: 5000
      });
      console.log(err);
    })
    .finally (() => {
      setIsInProgress(false);
    })
  }, []);
  if (config === null)
    return <LoadingIndicatorPage />;
  else
  {
    return (
      <>
      <Flex alignItems="stretch" gap={4}>
        <SubNavigation activeUrl={'/configure-collections/'}/>
          <Box padding={8} background="neutral100">
            <Box paddingBottom={4}>
              <Typography variant="alpha">Configure Collections</Typography>
            </Box>
            {
              config && (
                <TwoColsLayout startCol={
                <Table colCount={4} rowCount={config.length}>
                  <Thead>
                    <Tr>
                      <Th style={{width: "250px"}}>
                        <Typography variant="sigma">Collection</Typography>
                      </Th>
                      <Th style={{width: "250px"}}>
                        <Typography variant="sigma">Index</Typography>
                      </Th>
                      <Th style={{width: "250px"}}>
                        <Typography variant="sigma">Do not Index</Typography>
                      </Th> 
                      <Th>
                        <Typography variant="sigma">Actions</Typography>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {
                      config.map((collection, idx) => {
                        return (
                          <Tr key={idx}>
                            <Td>
                              <Typography textColor="neutral600">{collection.collectionName}
                              </Typography>
                            </Td>
                            <Td>
                              {collection.indexed.map((i) =>
                                <Box paddingBottom={2}>
                                  <Typography textColor="neutral600">{i}
                                  </Typography></Box>
                              )}
                            </Td>
                            <Td>
                              {collection.notIndexed.map((i) =>
                                <Box paddingBottom={2}>
                                  <Typography textColor="neutral600">{i}
                                </Typography></Box>
                              )}
                            </Td>    
                            <Td>
                              <IconButton onClick={() => history.push(`/plugins/${pluginId}/configure-collections/${collection.collectionName}`)} label="Edit collection configuration" noBorder icon={<Pencil />} />  
                              <IconButton onClick={() => scheduleCollectionIndexing(collection.collectionName)} label="Schedule indexing for all items in this collection" noBorder icon={<Server />} />  
                            </Td>                  
                          </Tr>
                        );
                      })
                    }
                  </Tbody>
                </Table>}
                endCol={<>
                  <Box paddingLeft={2} paddingRight={2} paddingTop={4} paddingBottom={4} >
                      <Box paddingTop={4} paddingBottom={4}>
                          <Typography variant="pi" fontWeight="bold" textColor="neutral600" >CONFIG ACTIONS</Typography>
                      </Box>
                      <Divider />
                      <Box paddingTop={4} paddingBottom={4}>
                          <Box paddingTop={2} paddingBottom={2}>
                              <Button loading={isInProgress} fullWidth variant="secondary" onClick={performExport}>Export</Button>
                          </Box>
                          <Box paddingTop={2} paddingBottom={2}>
                              <Button loading={isInProgress} fullWidth variant="secondary" onClick={() => setDisplayImportModal(true)}>Import</Button>
                          </Box>
                      </Box>
                  </Box>
                  </>
                  } />
              )
            }          
            {displayImportModal && 
              <ModalLayout onClose={() => setDisplayImportModal(false)} labelledBy="title">
              <ModalHeader>
              <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                Import Search Configuration
              </Typography>
            </ModalHeader>
            <ModalBody>
              <Textarea 
              label="Configuration Json" 
              error={!isEnteredJsonValid ? 'Invalid Json' : undefined}
              onChange={e => setImportJson(e.target.value)}
              >{importJson}</Textarea>
            </ModalBody>
            <ModalFooter startActions={<Button onClick={() => setDisplayImportModal(false)} variant="tertiary">
                  Cancel
                </Button>} endActions={<>
                  <Button loading={isInProgress} onClick={performImport} disabled={!isEnteredJsonValid && !importJson.length>0}>Import</Button>
                </>} />
          </ModalLayout>}
          </Box>
          </Flex>
      </>
    );
  }
};

export default Configure;
