// Organization store initialization plugin
export default {
  install: async (app, { store }) => {
    // Initialize organization data when the app starts
    await store.dispatch('organization/initializeStore');

    // Add a global property to easily check if org data is loaded
    app.config.globalProperties.$isOrgInitialized = () => store.getters['organization/isInitialized'];
  }
};
