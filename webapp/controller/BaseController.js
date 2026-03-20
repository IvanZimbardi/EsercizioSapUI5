sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "testlista/model/formatter"],
  function (Controller, JSONModel, formatter) {
    "use strict";

    return Controller.extend("testlista.controller.BaseController", {
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
      navTo: function (sName, oParameters, bReplace) {
        this.getRouter().navTo(sName, oParameters, undefined, bReplace);
      },
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
      getText: function (sKey) {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey);
      },

      async getEntity(sPath, oKey, oUrlParameters = {}, sExpand = "") {
        try {
          const oDataModel = this.getModel();
          const sKey = oDataModel.createKey(sPath, oKey);
          oUrlParameters["$expand"] = sExpand;

          const data = await new Promise((resolve, reject) => {
            oDataModel.read(sKey, {
              urlParameters: oUrlParameters,
              success: (data, response) => resolve({ data, response }),
              error: (error) => reject(error),
            });
          });

          return {
            data: data.data,
            response: data.response,
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },

      getEntitySet: async function (
        sPath,
        aFilters = [],
        oUrlParameters = {},
        iTop = 0,
        iSkip = 0,
        sSort = "",
        sExpand = "",
      ) {
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
          throw error;
        }
      },
      deleteEntity: async function (sPath, oKey, oUrlParameters = {}) {
        try {
          const oDataModel = this.getModel();
          const sKey = oDataModel.createKey(sPath, oKey);

          const data = await new Promise((resolve, reject) => {
            oDataModel.remove(sKey, {
              urlParameters: oUrlParameters,
              method: "DELETE",
              success: (data, response) => resolve({ data, response }),
              error: (error) => reject(error),
            });
          });

          return {
            data: data.data,
            response: data.response,
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      createEntity: async function (sPath, oPayload, oUrlParameters = {}) {
        try {
          const oDataModel = this.getModel();
          oPayload = formatter.convertRecorsiveInUTCRome(oPayload);

          const data = await new Promise(async function (resolve, reject) {
            oDataModel.create(sPath, oPayload, {
              urlParameters: oUrlParameters,
              success: (data, response) => resolve({ data, response }),
              error: (error) => reject(error),
            });
          });
          return {
            data: data.data,
            response: data.response,
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      updateEntity: async function (sPath, oKey, oData, oUrlParameters = {}, bCallGetEntity = true) {
        try {
          const oDataModel = this.getModel();
          const sKey = oDataModel.createKey(sPath, oKey);

          const data = await new Promise((resolve, reject) => {
            oDataModel.update(sKey, oData, {
              urlParameters: oUrlParameters,
              success: async (data, response) => {
                if (bCallGetEntity) {
                  const read = await this.getEntity(sPath, oKey);

                  resolve({ data: read.data, response: response });
                } else {
                  resolve({ data: data, response: response });
                }
              },
              error: (error) => reject(error),
            });
          });

          return {
            data: data.data,
            response: data.response,
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    });
  },
);
