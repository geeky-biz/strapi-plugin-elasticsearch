import React, { useState, useEffect } from 'react';
import { Page } from '@strapi/admin/strapi-admin';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import  { SubNavigation } from '../components/SubNavigation';;
import { Box, Flex } from '@strapi/design-system';
import { apiFetchRecentIndexingRunLog } from "../utils/apiUrls";
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import Loader from "../components/Loader";
import pluginId from '../pluginId';
const ViewIndexingRunLog = () => {
  const [logTable, setLogTable] = useState(null);
  const { get } = useFetchClient();
  const loadRecentIndexingRuns = () => {
    return get(apiFetchRecentIndexingRunLog)
        .then((resp) => resp.data)
        .then((data) => {
          return data;
        });
  } 
  
  const formattedDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    
    const dateTimeFormat = new Intl.DateTimeFormat('en-US', options);
    const parts = dateTimeFormat.formatToParts(date);
    
    let formattedDate = '';
    parts.forEach((part) => {
        if (part.type === "weekday") 
            formattedDate+= `${part.value}, `;
         if (part.type === "day") 
            formattedDate+= `${part.value}/`;   
         if (part.type === "month") 
            formattedDate+= `${part.value}/`;  
         if (part.type === "year") 
            formattedDate+= `${part.value}  `;
         if (part.type === "hour") 
            formattedDate+= `${part.value}:`;
         if (part.type === "minute") 
            formattedDate+= `${part.value}`;         
    });
  
    return formattedDate;
  }

  useEffect(() => {
    loadRecentIndexingRuns()
    .then(setLogTable)
    }, []);
  
  if (logTable === null)
        return <Loader />
  else
    return (
      <Page.Main>
        <Page.Title>Recent Indexing Run Logs</Page.Title>
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation activeUrl={`/plugins/${pluginId}/view-indexing-logs`} />
            <Box padding={8} background="neutral100" width="100%">
              <Box paddingBottom={4}>
                <Typography variant="alpha">Recent Indexing Run Logs</Typography>
              </Box>
              {
                logTable && logTable.length > 0 && (
                  <>
                    <Table colCount={3} rowCount={logTable.length}>
                      <Thead>
                        <Tr>
                          <Th>
                            <Typography variant="sigma">Date</Typography>
                          </Th>
                          <Th>
                            <Typography variant="sigma">Status</Typography>
                          </Th>
                          <Th>
                            <Typography variant="sigma">Details</Typography>
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                      {
                        logTable.map((data, index) => {
                          return (
                            <Tr key={index}>
                              <Td>
                                <Typography textColor="neutral600">{formattedDate(data.createdAt)}</Typography>
                              </Td>
                              <Td>
                                <Typography textColor="neutral600">{data.status}</Typography>
                              </Td>
                              <Td>
                                <Typography textColor="neutral600">{data.details}</Typography>
                              </Td>                                 
                            </Tr>
                          );
                        })
                      }
                      </Tbody>
                    </Table>
                    <Box paddingTop={2} paddingBottom={2}>
                      <Typography textColor="neutral600">This view lists the details of the 50 recent-most indexing runs.</Typography>
                    </Box>
                  </>
                )
              }
            </Box>    
        </Flex>
      </Page.Main>
  );
};

export default ViewIndexingRunLog;
