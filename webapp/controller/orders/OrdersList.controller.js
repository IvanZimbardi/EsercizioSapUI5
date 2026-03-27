sap.ui.define(
  [
    "../BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/export/library",
    "testlista/util/entityUtils",
    "testlista/model/formatter",
  ],
  function (BaseController, JSONModel, MessageBox, exportLibrary, entityUtils, formatter) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    const TOP = 15;
    const SKIP = 0;

    const INIT_MODEL_ORDERS = {
      Data: [],
      Skip: SKIP,
      Top: TOP,
      Count: 0,
      Sort: "",
      Filters: [],
    };

    const INIT_MODEL_FILTERS = {
      NumOrdine: "",
      Cliente: "",
      Stato: "",
    };

    return BaseController.extend("testlista.controller.orders.OrdersList", {
      onInit: function () {
        this.getRouter().getRoute("RouteOrdersList").attachPatternMatched(this._onObjectMatched, this);
        this.oModelOrders = this.setModel(new JSONModel(INIT_MODEL_ORDERS), "Orders");
        this.oModelFilters = this.setModel(new JSONModel(INIT_MODEL_FILTERS), "Filters");
      },

      formatter: formatter,

      _onObjectMatched: async function () {
        this.setBusy(true);
        try {
          await this._loadOrders();
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },
      onNavToAddOrders: function (oEvent) {
        this.navTo("RouteOrders");
      },

      onNavToEditOrders: function (oEvent) {
        const sKey = oEvent.getSource().getParent().getBindingContext("Orders").getObject().NumOrdine;
        this.navTo("RouteOrdersDetail", { NumOrdine: sKey });
      },

      _loadOrders: async function () {
        const aFilters = this.oModelOrders.getProperty("/Filters");
        const iTop = this.oModelOrders.getProperty("/Top");
        const iSkip = this.oModelOrders.getProperty("/Skip");
        const sSort = this.oModelOrders.getProperty("/Sort");

        const oResult = await this.getEntitySet("/ZES_lista_ordiniSet", aFilters, {}, iTop, iSkip, sSort);

        this.oModelOrders.setProperty("/Data", oResult.data);

        return oResult;
      },

      onSearch: async function (oEvent) {
        let aFilters = [];
        let oOrdersFilters = this.oModelFilters.getData();

        entityUtils.setFilterEQ(aFilters, "NumOrdine", oOrdersFilters.NumOrdine);
        entityUtils.setFilterEQ(aFilters, "Cliente", oOrdersFilters.Cliente);
        entityUtils.setFilterEQ(aFilters, "Stato", oOrdersFilters.Stato);

        this.setBusy(true);
        try {
          this.oModelOrders.setProperty("/Top", TOP);
          this.oModelOrders.setProperty("/Skip", SKIP);
          this.oModelOrders.setProperty("/Filters", aFilters);

          await this._loadOrders();
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },

      _onReset: async function () {
        this.oModelFilters.setProperty("/NumOrdine", "");
        this.oModelFilters.setProperty("/Cliente", "");
        this.oModelFilters.setProperty("/Stato", "");
        this.oModelOrders.setProperty("/Filters", []);

        const oResult = await this.getEntitySet("/ZES_lista_ordiniSet");

        this.oModelOrders.setProperty("/Data", oResult.data);

        return oResult;
      },
    });
  },
);
