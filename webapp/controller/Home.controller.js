sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("testlista.controller.Home", {
      onInit: function () {
        this.getRouter().getRoute("RouteHome").attachPatternMatched(this._onObjectMatched, this);
        this.oModelProducts = this.setModel(new JSONModel({}), "Products");
      },

      _onObjectMatched: async function () {
        this.setBusy(true);

        try {
          await this.onLoadProducts();
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },

      onLoadProducts: async function () {
        this.setBusy(true);
        try {
          const oResultProducts = await this.getEntitySet("/ZES_articoliSet");
          this.oModelProducts.setData(oResultProducts.data);
        } catch (error) {
          console.error("Errore nel caricamento prodotti: ", error);
          throw error;
        } finally {
          this.setBusy(false);
        }
      },
    });
  },
);
