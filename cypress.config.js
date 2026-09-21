const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",

  reporterOptions: {
    reportDir: "cypress/reports",
    reportFilename: "index",
    reportPageTitle: "Conduit - Relatório de Testes",
    embeddedScreenshots: true,
    inlineAssets: true,
    charts: true,
    overwrite: true,
  },

  e2e: {
    baseUrl: "http://localhost:3000",

    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
    },
  },
});
