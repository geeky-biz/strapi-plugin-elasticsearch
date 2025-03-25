import React from 'react';
import { Loader } from '@strapi/design-system';
import { styled } from 'styled-components';

const FullScreenOverlay = styled.div`
 display: flex;
 background: rgba(255, 255, 255, 0.5);
 position: fixed;
 bottom: 0;
 left: 0;
 right: 0;
 top: 0;
 z-index: 9998;
 align-items: center;
 justify-content: center;
`;

const FullScreenLoader = () => {
   return (
       <FullScreenOverlay>
           <Loader>Loading content...</Loader>
       </FullScreenOverlay>
   );
}
export default FullScreenLoader;
