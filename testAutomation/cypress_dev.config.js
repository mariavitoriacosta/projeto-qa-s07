const { defineConfig } = require("cypress");
// colocar aqui todas as infos necessárias para rodar de forma local, semelhante ao arquivo de prod

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
