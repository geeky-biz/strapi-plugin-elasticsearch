
module.exports = ({ strapi }) => {
    const logIndexingService = strapi.plugins['strapi-plugin-elasticsearch'].services.logIndexing;
    const fetchRecentRunsLog = async (ctx) => {
        return await logIndexingService.fetchIndexingLogs();
    }

    return {
        fetchRecentRunsLog
    };
}
