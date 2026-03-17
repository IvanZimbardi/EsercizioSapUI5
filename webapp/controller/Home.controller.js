sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("testlista.controller.Home", {
    onInit: function () {
      this.oModelProducts = this.setModel(new JSONModel({}), "Products");
    },

    onProductsTable: async function () {
      try {
        const oResult = await this.getEntitySet("/ZES_articoliSet");
        console.log("Dati caricati:", oResult.data);
      } catch (oError) {
        console.error("Errore durante il caricamento degli articoli", oError);
      }
    },
  });
});
