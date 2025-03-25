import React, { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Alert } from '@strapi/design-system';
import  { SubNavigation } from '../components/SubNavigation';
import { Box, Flex, Tab } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { apiGetElasticsearchSetupInfo, apiRequestReIndexing,
    apiTriggerIndexing } from '../utils/apiUrls';
import { Table, Tr, Td } from '@strapi/design-system';
import { ArrowClockwise } from '@strapi/icons';
import { Button } from '@strapi/design-system';
import { Grid } from '@strapi/design-system';
import { Divider } from '@strapi/design-system';
import Loader from "../components/Loader";
import pluginId from '../pluginId';
import TooltipIconButton from '../components/TooltipIconButton';
const Homepage = () => {
  const [alertContent, setAlertContent] = useState(null);  
  const [setupInfo, setSetupInfo] = useState(null);
  const [isInProgress, setIsInProgress] = useState(false);
  const { get } = useFetchClient();
    
  const showMessage =  ({variant, title, text}) => {
    setAlertContent({variant, title, text});
    setTimeout(() => {
        setAlertContent(null);
    }, 5000);
  };
  
  const displayLabels = {'connected' : 'Connected',
        'elasticCertificate' : 'Certificate',
        'elasticHost' : 'Elasticsearch host',
        'elasticIndexAlias' : 'Elasticsearch index Alias name',
        'elasticUserName' : 'Elasticsearch username',
        'indexingCronSchedule' : 'Indexing cron schedule',
        'initialized' : 'Elasticsearch configuration loaded'};

    const loadElasticsearchSetupInfo = () => {
        return get(apiGetElasticsearchSetupInfo)
          .then((resp) => resp.data)
          .then((data) => {
            return data;
          });
    };

    const reloadElasticsearchSetupInfo = ({showNotification}) => {
        setIsInProgress(true);
        loadElasticsearchSetupInfo()
        .then(setSetupInfo)
        .then(() => {
            if (showNotification)
              showMessage({variant: 'success', title: 'Success', text: 'Elasticsearch setup information reloaded.'})
        })
        .catch(() => {
            showMessage({variant: 'danger', title: 'Error', text: 'An error was encountered. Please contact support.'})
        })
        .finally(() => setIsInProgress(false));
    }

    const requestFullSiteReindexing = () => {
        setIsInProgress(true);
        return get(apiRequestReIndexing)
            .then(() => {
                showMessage({variant: 'success', title: 'Success', text: 'Rebuilding the index is triggered.'})
            })
            .catch(() => {
                showMessage({variant: 'warning', title: 'Error', text: 'An error was encountered.'})
            })
            .finally(() => setIsInProgress(false));
    }

    const triggerIndexingRun = () => {
        setIsInProgress(true);
        return get(apiTriggerIndexing)
        .then(() => {
            showMessage({variant: 'success', title: 'Success', text: 'The indexing job to process the pending tasks is started.'})
        })
        .catch(() => {
            showMessage({variant: 'warning', title: 'Error', text: 'An error was encountered.'})
        })
        .finally(() => setIsInProgress(false));
    }
    useEffect(() => {
        reloadElasticsearchSetupInfo({showNotification: false});
    }, []);
    if (setupInfo === null)
        return (<Loader />);
    else
        return (
        <Flex alignItems="stretch" gap={4}>
        <SubNavigation activeUrl={`/plugins/${pluginId}/`} />
        <Box padding={8} background="neutral100" width="100%">
        <Box paddingBottom={4}>
            <Typography variant="alpha">Setup Information</Typography>
        </Box>   
        {
          alertContent && 
          <Alert closeLabel="Close alert" title={alertContent.title} variant={alertContent.variant}>{alertContent.text}</Alert>
        }
        <Box  width="100%" paddingBottom={4}>
        <Grid.Root paddingTop={8} gap={4}>
        <Grid.Item col={9} s={12} direction="column" alignItems="stretch">
            <Table>
              <tbody>
            {
                setupInfo && (
                    Object.keys(setupInfo).map((k, idx) => {
                        return (
                            <Tr key={idx}>
                                <Td><Box padding={2}>
                                    <Typography textColor="neutral600">{displayLabels[k]} :</Typography>
                                </Box></Td>
                                <Td>
                                  { 
                                                k === 'connected' && setupInfo[k] === true && 
                                                (
                                                  <Grid.Root>
                                                  <Grid.Item col={1} direction="column" alignItems="stretch">
                                                    <Typography fontWeight="bold" textColor="success500" marginRight={2}>Yes</Typography>
                                                  </Grid.Item>
                                                  <Grid.Item col={1} direction="column">
                                                    <TooltipIconButton disabled={isInProgress} withTooltip={false} tooltip="Refresh" onClick={() => reloadElasticsearchSetupInfo({showNotification: true})} label="Refresh"><ArrowClockwise /></TooltipIconButton>
                                                  </Grid.Item>
                                                    </Grid.Root>
                                                )
                                  }
                                  { 
                                                k === 'connected' && setupInfo[k] === false && 
                                                (
                                                  <Grid.Root>
                                                  <Grid.Item col={1} direction="column" alignItems="stretch">
                                                    <Typography fontWeight="bold" textColor="danger500" marginRight={2} >No</Typography>
                                                  </Grid.Item>
                                                  <Grid.Item col={1} direction="column">
                                                    <TooltipIconButton disabled={isInProgress} withTooltip={false} tooltip="Refresh" onClick={() => reloadElasticsearchSetupInfo({showNotification: true})} label="Refresh"><ArrowClockwise /></TooltipIconButton>
                                                  </Grid.Item>
                                                  </Grid.Root>
                                                )
                                  }
                                  {
                                                k !== 'connected' && 
                                                (
                                                    <Typography textColor="neutral600">{String(setupInfo[k])}</Typography>
                                                )
                                  }
                                </Td>
                            </Tr>
                        );
                    })
                )
            }
            </tbody>
            </Table>
            </Grid.Item>
            <Grid.Item col={3} s={12} direction="column" alignItems="stretch">
            <Box background="white" paddingLeft={2} paddingRight={2} paddingTop={4} paddingBottom={4} >
                <Box paddingTop={4} paddingBottom={4}>
                    <Typography variant="pi" fontWeight="bold" textColor="neutral600" >ACTIONS</Typography>
                </Box>
                <Divider />
                <Box paddingTop={4} paddingBottom={4}>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestFullSiteReindexing}>Rebuild Index</Button>
                    </Box>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={triggerIndexingRun}>Trigger Indexing</Button>
                    </Box>
                </Box>
            </Box>
            </Grid.Item>
        </Grid.Root>
        </Box>
        </Box>
        </Flex>
        );
};


export default Homepage;