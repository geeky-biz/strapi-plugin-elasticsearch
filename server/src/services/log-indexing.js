module.exports = ({ strapi }) => ({
    async recordIndexingPass(message) {
        const entry = await strapi.documents('plugin::elasticsearch.indexing-log').create({
            data : {
                status: 'pass',
                details: message
            }
        });
    },
    async recordIndexingFail(message) {
        const entry = await strapi.documents('plugin::elasticsearch.indexing-log').create({
            data : {
                status: 'fail',
                details: String(message)
            }
        });
    },
    async fetchIndexingLogs(count = 50) {
        const records = await strapi.documents('plugin::elasticsearch.indexing-log').findMany({
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count
        });
        return records;
    }
});