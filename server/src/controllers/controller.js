const controller = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('strapi-plugin-elasticsearch')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
});

export default controller;
