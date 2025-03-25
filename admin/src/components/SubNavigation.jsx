import React from 'react';
import { ChevronRight } from '@strapi/icons';
import { Box } from '@strapi/design-system';
import {
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from '@strapi/design-system';
import { NavLink } from 'react-router-dom';
import pluginId from "../pluginId";

export const SubNavigation = ({activeUrl}) => {
  const links = [ {
    id: 1,
    label : 'Setup Information',
    href : `/plugins/${pluginId}/`,
  },
  {
    id: 2,
    label : 'Configure Collections',
    href : `/plugins/${pluginId}/configure-collections`,
  },
{
  id: 3,
  label : 'Indexing Run Logs',
  href : `/plugins/${pluginId}/view-indexing-logs`,
}];
  return (<Box style={{
        height: '100vh'
      }} background="neutral200">
            <SubNav ariaLabel="Settings sub nav">
              <SubNavHeader label="Strapi Elasticsearch" />
              <SubNavSections>
                <SubNavSection>
                  {links.map(link => <SubNavLink 
                  tag={NavLink} to={link.href} key={link.id} active={link.href === activeUrl} >
                      {link.label}
                  </SubNavLink>)}
                </SubNavSection>
              </SubNavSections>
            </SubNav>
        </Box>);
}