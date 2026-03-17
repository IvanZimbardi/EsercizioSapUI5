sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("testlista.controller.Home", {
    onInit: function () {
      this.oModelProducts = this.setModel(new JSONModel({}), "Products");

      this.onLoadProducts();
    },

    onLoadProducts: async function () {
      this.setBusy(true);
      try {
        const oResultProducts = await this.getEntitySet("/ZES_articoliSet");

        let oListProducts = oResultProducts.data;

        this.oModelProducts.setData(oListProducts);
      } catch (error) {
        console.error("Errore nel caricamento prodotti: ", error);
      } finally {
        this.setBusy(false);
      }
    },
  });
});
