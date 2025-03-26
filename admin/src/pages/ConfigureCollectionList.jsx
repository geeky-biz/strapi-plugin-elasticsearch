/*
 *
 * HomePage
 *
 */

import React, { useState } from 'react';
import { Page } from '@strapi/admin/strapi-admin';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import pluginId from '../pluginId';
import  { SubNavigation } from '../components/SubNavigation';
import { Grid, Box, Flex } from '@strapi/design-system';
import { useEffect } from 'react';
import { apiGetContentConfig, apiRequestCollectionIndexing,
        apiImportContentConfig, apiExportContentConfig } from "../utils/apiUrls";
import { Alert } from '@strapi/design-system';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { Pencil, Server } from '@strapi/icons';
import { useNavigate } from "react-router-dom";
import { Button } from '@strapi/design-system';
import { Modal } from '@strapi/design-system';
import { Textarea, Divider } from '@strapi/design-system';
import Loader from '../components/Loader';
import TooltipIconButton from '../components/TooltipIconButton';


const Configure = () => {
  const [alertContent, setAlertContent] = useState(null);  
  const [isInProgress, setIsInProgress] = useState(false);
  const [displayImportModal, setDisplayImportModal] = useState(true);
  const [isEnteredJsonValid, setIsEnteredJsonValid] = useState(true);
  const [importJson, setImportJson] = useState(null);

  const [config, setConfig] = useState(null);
  const navigate = useNavigate();
  const { get, post } = useFetchClient();

  const showMessage =  ({variant, title, text}) => {
    setAlertContent({variant, title, text});
    setTimeout(() => {
        setAlertContent(null);
    }, 5000);
  };

  const exportContentConfig = () => {
      
    return get(apiExportContentConfig, {
      responseType: 'blob'
    })
    .then((response) => {
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
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
    return post(apiImportContentConfig, {
        data : conf
    });
  }

  const loadContentConfig = () => {
    return get(apiGetContentConfig)
        .then((resp) => resp.data);
  } 

  const scheduleCollectionIndexing = (collectionName) => {
    setIsInProgress(true);
    return get(apiRequestCollectionIndexing(collectionName))
    .then(() => {
      showMessage({variant: "success", title: "Success", text: `Collection ${collectionName} scheduled for indexing.`});
    })
    .catch((err) => {
      showMessage({variant: "warning", title: "Error", text: "Scheduling collection indexing failed. An error was encountered."});
      console.log(err);
    })
    .finally(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsInProgress(false)
    });
  }

  const performImport = () => {
    const conf = importJson
    console.log(conf && conf.length > 0)
    if (conf && conf.length > 0) {
      setIsInProgress(true);
      importContentConfig(conf)
      .then(() => {
        showMessage({variant: "success", title: "Success", text: "Collections configuration imported. Please refresh this view."});
      })
      .catch((err) => {
        showMessage({variant: "warning", title: "Error", text: "Importing collections configuration failed. An error was encountered."});
        console.log(err);
      })
      .finally(() => setIsInProgress(false));
    }
  }
  const performExport = () => {
    setIsInProgress(true);
    exportContentConfig()
    .then(() => {
      showMessage({variant: "success", title: "Success", text: "Collections configuration exported."});
    })
    .catch((err) => {
      showMessage({variant: "warning", title: "Error", text: "Exporting collections configuration failed. An error was encountered."});
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
      showMessage({variant: "warning", title: "Error", text: "An error was encountered while fetching the configuration."});
      console.log(err);
    })
    .finally (() => {
      setIsInProgress(false);
    })
  }, []);
  if (config === null)
    return <Loader />;
  else
  {
    return (
      <Page.Main>
      <Page.Title>Configure Collections</Page.Title>
        <Flex alignItems="stretch" gap={4}>
          <SubNavigation activeUrl={`/plugins/${pluginId}/configure-collections`}/>
          <Box padding={8} background="neutral100">
            <Box paddingBottom={4}>
              <Typography variant="alpha">Configure Collections</Typography>
            </Box>
            {alertContent && (
              <Alert closeLabel="Close alert" title={alertContent.title} variant={alertContent.variant}>
                {alertContent.text}
              </Alert>
            )}            
            {config && (
              <Grid.Root paddingTop={8} gap={4}>
                <Grid.Item col={9} s={12} direction="column" alignItems="stretch">
                  <Table colCount={4} rowCount={config.length}>
                    <Thead>
                      <Tr>
                        <Th style={{width: "350px", maxWidth: "350px"}}>
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
                      {config.map((collection, idx) => (
                        <Tr key={idx}>
                          <Td style={{width: "350px", maxWidth: "350px"}}>
                            <Typography textColor="neutral600" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{collection.collectionName}</Typography>
                          </Td>
                          <Td>
                            {collection.indexed.map((i) => (
                              <Box paddingBottom={2}>
                                <Typography textColor="neutral600">{i}</Typography>
                              </Box>
                            ))}
                          </Td>
                          <Td>
                            {collection.notIndexed.map((i) => (
                              <Box paddingBottom={2}>
                                <Typography textColor="neutral600">{i}</Typography>
                              </Box>
                            ))}
                          </Td>    
                          <Td>
                            <Flex gap={2}>
                            <TooltipIconButton 
                              withTooltip={false} 
                              onClick={() => navigate(`/plugins/${pluginId}/configure-collections/${collection.collectionName}`)} 
                              label="Edit collection configuration" 
                              noBorder
                            >
                              <Pencil />
                            </TooltipIconButton>  

                            <TooltipIconButton
                              withTooltip={false} 
                              onClick={() => scheduleCollectionIndexing(collection.collectionName)} 
                              label="Schedule indexing for all items in this collection" 
                              noBorder
                            >
                              <Server />
                            </TooltipIconButton>  
                            </Flex>
                          </Td>                  
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Grid.Item>
                <Grid.Item col={3} s={12} direction="column" alignItems="stretch">
                  <Box background="white" paddingLeft={2} paddingRight={2} paddingTop={4} paddingBottom={4}>
                    <Box paddingTop={4} paddingBottom={4}>
                      <Typography variant="pi" fontWeight="bold" textColor="neutral600">CONFIG ACTIONS</Typography>
                    </Box>
                    <Divider />
                    <Box paddingTop={4} paddingBottom={4}>
                      <Box paddingTop={2} paddingBottom={2}>
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={performExport}>
                          Export
                        </Button>
                      </Box>
                      <Box paddingTop={2} paddingBottom={2}>
                        <Modal.Root>
                          <Modal.Trigger>
                            <Button loading={isInProgress} fullWidth variant="secondary">Import</Button>
                          </Modal.Trigger>
                          <Modal.Content>
                            <Modal.Header>
                              <Modal.Title>Import Search Configuration</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Textarea 
                                label="Configuration Json" 
                                error={!isEnteredJsonValid ? 'Invalid Json' : undefined}
                                onChange={e => setImportJson(e.target.value)}
                              >
                                {importJson}
                              </Textarea>
                            </Modal.Body>
                            <Modal.Footer>
                              <Modal.Close>
                                <Button variant="tertiary">Cancel</Button>
                              </Modal.Close>
                              <Button 
                                loading={isInProgress} 
                                onClick={performImport} 
                                disabled={!isEnteredJsonValid && !importJson.length>0}
                              >
                                Import
                              </Button>
                            </Modal.Footer>
                          </Modal.Content>
                        </Modal.Root>
                      </Box>
                    </Box>
                  </Box>
                </Grid.Item>
              </Grid.Root>
            )}
          </Box>
        </Flex>
      </Page.Main>
    );
  }
};

export default Configure;
