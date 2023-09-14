
module.exports = ({ strapi }) => {
    const logIndexingService = strapi.plugins['elasticsearch'].services.logIndexing;
    const fetchRecentRunsLog = async (ctx) => {
        return await logIndexingService.fetchIndexingLogs();
    }

    return {
        fetchRecentRunsLog
    };
}
