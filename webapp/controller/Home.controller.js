sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("testlista.controller.Home", {
    onInit: function () {
      const oModel = new JSONModel({});
      this.getView().setModel(oModel, "Products");

      this.onLoadProducts();
    },

    onLoadProducts: async function () {
      this.setBusy(true);
      try {
        const oJSONModel = this.getModel("Products");
        const oResultProducts = await this.getEntitySet("/ZES_articoliSet");
        oJSONModel.setData(oResultProducts.data);
      } catch (error) {
        console.error("Errore nel caricamento prodotti: ", error);
      } finally {
        this.setBusy(false);
      }
    },
  });
});
