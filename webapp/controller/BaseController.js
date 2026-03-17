sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("testlista.controller.BaseController", {
    getModel: function (sName) {
      return this.getView().getModel(sName);
    },

    setModel: function (oModel, sName) {
      this.getView().setModel(oModel, sName);

      return this.getModel(sName);
    },

    getEntitySet: async function (sPath) {
      try {
        const oDataModel = this.getModel();

        const data = await new Promise((resolve, reject) => {
          oDataModel.read(sPath, {
            success: (data, response) => resolve({ data, response }),

            error: (error) => reject(error),
          });
        });

        return {
          data: data.data?.results || [],
          response: data.response,
        };
      } catch (error) {
        console.error("Errore OData:", error);
        throw error;
      }
    },
  });
});
