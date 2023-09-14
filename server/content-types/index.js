'use strict';

const task = require('./tasks');
const indexingLog = require('./indexing-logs');

module.exports = {
    'task' : {schema : task},
    'indexing-log' : {schema: indexingLog}
};
