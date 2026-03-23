sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "testlista/util/entityUtils",
  ],
  function (BaseController, JSONModel, MessageBox, exportLibrary, Spreadsheet, entityUtils) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    const TOP = 15;
    const SKIP = 0;

    const INIT_MODEL_PRODUCTS = {
      Data: [],
      Skip: SKIP,
      Top: TOP,
      Count: 0,
      Sort: "",
      Filters: [],
    };

    const INIT_MODEL_FILTERS = {
      CodArticolo: "",
      NomeArticolo: "",
    };

    return BaseController.extend("testlista.controller.Home", {
      onInit: function () {
        this.getRouter().getRoute("RouteHome").attachPatternMatched(this._onObjectMatched, this);
        this.oModelProducts = this.setModel(new JSONModel(INIT_MODEL_PRODUCTS), "Products");
        this.oModelFilters = this.setModel(new JSONModel(INIT_MODEL_FILTERS), "Filters");
      },

      _onObjectMatched: async function () {
        this.setBusy(true);
        try {
          await this._loadProducts();
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },

      onDeleteProducts: async function (oEvent) {
        const sProductCode = oEvent.getSource().getParent().getBindingContext("Products").getObject().CodArticolo;

        MessageBox.warning(this.getText("msgConfirmDelete"), {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: async (sKey) => {
            if (sKey !== sap.m.MessageBox.Action.YES) return;

            this.setBusy(true);
            try {
              await this.deleteEntity("/ZES_articoliSet", { CodArticolo: sProductCode });
              await this._loadProducts();
              MessageBox.success(this.getText("msgDelete"));
            } catch (error) {
              console.error(error);
              MessageBox.error(error.message);
            } finally {
              this.setBusy(false);
            }
          },
        });
      },

      onNavToAddProducts: function (oEvent) {
        this.navTo("RouteProducts");
      },

      onNavToEditProducts: function (oEvent) {
        const sKey = oEvent.getSource().getParent().getBindingContext("Products").getObject().CodArticolo;
        this.navTo("RouteDetailProducts", { CodArticolo: sKey });
      },

      createColumnConfig: function () {
        return [
          {
            label: "Codice",
            property: "CodArticolo",
            type: EdmType.Number,
            scale: 0,
          },
          {
            label: "Nome Articolo",
            property: "NomeArticolo",
            width: "25",
          },
          {
            label: "Importo",
            property: "Importo",
            type: EdmType.Currency,
          },
          {
            label: "Quantità Disponibili",
            property: "QuantitaDisp",
            type: EdmType.Number,
            scale: 0,
          },
        ];
      },

      onExport: function () {
        const oTable = this.byId("idArticlesTable");
        const oBinding = oTable.getBinding("items");
        const aCols = this.createColumnConfig();

        const oSettings = {
          workbook: { columns: aCols },
          dataSource: oBinding,
        };

        const oSheet = new Spreadsheet(oSettings);

        oSheet
          .build()
          .then(function () {
            MessageToast.show(this.getText("msgSuccessExcel"));
          })
          .finally(function () {
            oSheet.destroy();
          });
      },

      onSearch: async function (oEvent) {
        let aFilters = [];
        let oProductsFilters = this.oModelFilters.getData();

        entityUtils.setFilterEQ(aFilters, "CodArticolo", oProductsFilters.CodArticolo);
        entityUtils.setFilterEQ(aFilters, "NomeArticolo", oProductsFilters.NomeArticolo);

        this.setBusy(true);
        try {
          this.oModelProducts.setProperty("/Top", TOP);
          this.oModelProducts.setProperty("/Skip", SKIP);
          this.oModelProducts.setProperty("/Filters", aFilters);

          await this._loadProducts();
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },

      _loadProducts: async function () {
        const aFilters = this.oModelProducts.getProperty("/Filters");
        const iTop = this.oModelProducts.getProperty("/Top");
        const iSkip = this.oModelProducts.getProperty("/Skip");
        const sSort = this.oModelProducts.getProperty("/Sort");

        const oResult = await this.getEntitySet("/ZES_articoliSet", aFilters, {}, iTop, iSkip, sSort);

        this.oModelProducts.setProperty("/Data", oResult.data);

        return oResult;
      },
    });
  },
);
