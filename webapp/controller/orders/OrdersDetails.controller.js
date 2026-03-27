sap.ui.define(
  ["../BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "sap/ui/export/library"],
  function (BaseController, JSONModel, MessageBox, exportLibrary) {
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

    const INIT_MODE = {
      title: "",
      isEdit: false,
    };

    const INIT_DATA_ORDERS = {
      Operation: "",
      NumOrdine: 0,
      ZET_lista_ordini: {
        NumOrdine: 0,
        Cliente: "",
        DataOrdine: "0000-00-00 'T' 00:00:00",
        ImportoTot: 0,
        Stato: 0,
        StatoTxt: "",
      },
      ZET_dettagli_ordiniSet: { results: [] },
    };

    const INIT_STATES = [
      { key: "01", text: "Creato" },
      { key: "02", text: "In elaborazione" },
      { key: "03", text: "In transito" },
      { key: "04", text: "Chiuso" },
    ];

    return BaseController.extend("testlista.controller.orders.OrdersDetails", {
      onInit: function () {
        this.getRouter().getRoute("RouteOrders").attachPatternMatched(this._onNew, this);

        this.getRouter().getRoute("RouteOrdersDetail").attachPatternMatched(this._onEdit, this);

        this.oModelOrders = this.setModel(new JSONModel(INIT_DATA_ORDERS), "Orders");

        this.oModelMode = this.setModel(new JSONModel(INIT_MODE), "Mode");

        this.oModelProducts = this.setModel(new JSONModel(INIT_MODEL_PRODUCTS), "Products");

        this.oModelStates = this.setModel(new JSONModel(INIT_STATES), "States");
      },

      onNavToOrdersList: function (oEvent) {
        this.navTo("RouteOrdersList");
      },

      _onNew: async function () {
        this.oModelMode.setProperty("/title", "Nuovo Ordine");
        this.oModelMode.setProperty("/isEdit", false);

        this.oModelOrders.setData({ ...INIT_DATA_ORDERS });
      },

      _onEdit: async function (oEvent) {
        this.oModelMode.setProperty("/title", "Modifica Ordine");
        this.oModelMode.setProperty("/isEdit", true);

        const oPayload = this.oModelOrders.getData();
        const sNumOrdine = oEvent.getParameter("arguments").NumOrdine;

        oPayload.Operation = "R";
        oPayload.NumOrdine = Number(sNumOrdine);
        oPayload.ZET_lista_ordini.NumOrdine = Number(sNumOrdine);
        oPayload.ZET_lista_ordini.DataOrdine = Number(oPayload.ZET_lista_ordini.DataOrdine);
        console.log(oPayload, "opayload");
        this.setBusy(true);
        try {
          const oResult = await this.createEntity("/ZES_DeepOrdiniSet", oPayload);
          console.log(oResult, "oresult");
          this.oModelOrders.setData(oResult.data);
          console.log(this.oModelOrders.getData(), "omodel");
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },

      onSaveOrders: async function () {
        const oPayload = this.oModelOrders.getData();
        const oMode = this.oModelMode.getData();

        if (oMode.isEdit) {
          this.setBusy(true);
          try {
            oPayload.Operation = "U";
            const oResult = await this.createEntity("/ZES_DeepOrdiniSet", oPayload);
            console.log("opay", oPayload);
            MessageBox.success(this.getText("msgEditOrder"), {
              action: [sap.m.MessageBox.Action.CLOSE],
              onClose: () => {
                this.navTo("RouteOrdersList");
              },
            });
            this.oModelOrders.setData(oResult.data);
          } catch (error) {
            console.error(error);
            MessageBox.error(error?.message);
          } finally {
            this.setBusy(false);
          }
        } else {
          this.setBusy(true);
          try {
            oPayload.Operation = "C";
            const oResult = await this.createEntity("/ZES_DeepOrdiniSet", oPayload);
            console.log("opay", oPayload);
            MessageBox.success(this.getText("msgSuccessOrder"), {
              action: [sap.m.MessageBox.Action.CLOSE],
              onClose: () => {
                this.navTo("RouteOrdersList");
              },
            });
            this.oModelOrders.setData(oResult.data);
          } catch (error) {
            console.error(error);
            MessageBox.error(error?.message);
          } finally {
            this.setBusy(false);
          }
        }
      },

      onAddProductsDialog: async function () {
        this.setBusy(true);
        try {
          const aFilters = this.oModelProducts.getProperty("/Filters");
          const iTop = this.oModelProducts.getProperty("/Top");
          const iSkip = this.oModelProducts.getProperty("/Skip");
          const sSort = this.oModelProducts.getProperty("/Sort");

          const oResult = await this.getEntitySet("/ZES_articoliSet", aFilters, {}, iTop, iSkip, sSort);

          this.oModelProducts.setProperty("/Data", oResult.data);

          if (!this._oDialogProducts) {
            this._oDialogProducts = await this.loadFragment("testlista.view.dialog.AddProd");
          }

          this._oDialogProducts.open();
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }
      },

      onCloseProductsDialog: function () {
        if (this._oDialogProducts) {
          this._oDialogProducts.close();
        }
      },

      onConfirmProductsSelection: function () {
        const oTable = this.byId("idDialogOrderTable");
        const aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          MessageBox.warning("Seleziona almeno un prodotto.");
          return;
        }

        const oOrdersModel = this.oModelOrders;
        const oOrdersData = oOrdersModel.getData();

        if (!oOrdersData.ZET_dettagli_ordiniSet.results) {
          oOrdersData.ZET_dettagli_ordiniSet.results = [];
        }

        aSelectedItems.forEach((oItem) => {
          const oProduct = oItem.getBindingContext("Products").getObject();

          const oNewDetail = {
            NumOrdine: oOrdersData.NumOrdine || 0,
            CodiceArticolo: oProduct.CodiceArticolo,
            NomeArticolo: oProduct.NomeArticolo,
            Importo: oProduct.Importo,
            Quantita: 1,
          };

          oOrdersData.ZET_dettagli_ordiniSet.results.push(oNewDetail);
        });

        oOrdersModel.refresh(true);
        
        oTable.removeSelections();

        this.onCloseProductsDialog();

        MessageBox.success(aSelectedItems.length + " prodotti aggiunti correttamente.");
      },
      
    });
  },
);
