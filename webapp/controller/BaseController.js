sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("testlista.controller.BaseController", {
    getModel: function (sName) {
      return this.getView().getModel(sName);
    },

    setModel: function (oModel, sName) {
      this.getView().setModel(oModel, sName);

      return this.getModel(sName);
    },
    setBusy: function (bBusy) {
      this.getView().setBusy(bBusy);
    },

    async getEntitySet(sPath, aFilters = [], oUrlParameters = {}, iTop = 0, iSkip = 0, sSort = "", sExpand = "") {
      try {
        const oDataModel = this.getModel();

        const oUrlParametersStandard = {
          $top: iTop,
          $skip: iSkip,
          $inlinecount: "allpages",
          $orderby: sSort,
          $expand: sExpand,
        };

        const oUrlParametersMerge = { ...oUrlParametersStandard, ...oUrlParameters };

        const data = await new Promise((resolve, reject) => {
          oDataModel.read(sPath, {
            filters: aFilters,
            urlParameters: oUrlParametersMerge,
            success: (data, response) => resolve({ data, response }),
            error: (error) => reject(error),
          });
        });

        return {
          data: data.data?.results || [],
          response: data.response,
          count: parseInt(data.data?.__count, 10) || 0,
        };
      } catch (error) {
        console.error(error);
        throw new Error(`${errorMessage || error?.message || error}`);
      }
    },
  });
});
