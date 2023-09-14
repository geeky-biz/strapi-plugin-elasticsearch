'use strict';

const configureIndexing = require('./configure-indexing');
const performSearch = require('./perform-search');
const logIndexing = require('./log-indexing');
const setupInfo = require('./setup-info');
const performIndexing = require('./perform-indexing');

module.exports = {
  configureIndexing,
  performSearch,
  logIndexing,
  setupInfo,
  performIndexing
};
