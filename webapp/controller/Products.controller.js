sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "testlista/model/formatter"],
  function (BaseController, JSONModel, MessageBox, formatter) {
    "use strict";

    const INIT_MODE = {
      title: "",
      isEdit: false,
    };

    const INIT_DATA_PRODUCTS = {
      CodArticolo: 1,
      NomeArticolo: "",
      Importo: 0,
      QuantitaDisp: 0,
    };

    return BaseController.extend("testlista.controller.Products", {
      onInit: function () {
        this.getRouter().getRoute("RouteProducts").attachPatternMatched(this._onNew, this);

        this.getRouter().getRoute("RouteDetailProducts").attachPatternMatched(this._onEdit, this);

        this.oModelProducts = this.setModel(new JSONModel(INIT_DATA_PRODUCTS), "Products");
        this.oModelMode = this.setModel(new JSONModel(INIT_MODE), "Mode");
      },
      _onNew: async function () {
        this.oModelMode.setProperty("/title", "Nuovo Prodotto");
        this.oModelMode.setProperty("/isEdit", false);
        this.oModelProducts.setData(INIT_DATA_PRODUCTS);
        console.log("nuovo prod");
      },

      _onEdit: async function (oEvent) {
        this.oModelMode.setProperty("/title", "Modifica Prodotto");
        this.oModelMode.setProperty("/isEdit", true);
        const sCodArticolo = oEvent.getParameter("arguments").CodArticolo;
        this.setBusy(true);

        try {
          const oResult = await this.getEntity("/ZES_articoliSet", { CodArticolo: sCodArticolo });
          console.log(oResult.data, "ores");
          this.oModelProducts.setData(oResult.data);
        } catch (error) {
          console.error(error);
          MessageBox.error(error?.message);
        } finally {
          this.setBusy(false);
        }

        console.log("edit prod");
      },

      onNavToHomeProducts: function () {
        console.log("bottone cliccato");
        this.navTo("RouteHome");
      },

      onSaveProducts: async function () {
        const oUpdateProd = this.oModelProducts.getData();
        const sProdCode = oUpdateProd.CodArticolo;
        const oMode = this.oModelMode.getData();
        if (oMode.isEdit) {
          try {
            let oResult = await this.updateEntity("/ZES_articoliSet", { CodArticolo: sProdCode }, oUpdateProd);
            MessageBox.success(this.getText("msgEditProd"), {
              action: [sap.m.MessageBox.Action.CLOSE],
              onClose: () => {
                this.navTo("RouteHome");
              },
            });
            this.oModelProducts.setData(oResult.Data);
          } catch (error) {
            console.error(error);
            MessageBox.error(error.message);
          } finally {
            this.setBusy(false);
          }
        } else {
          let oPayload = this.oModelProducts.getData();
          this.setBusy(true);
          try {
            await this.createEntity("/ZES_articoliSet", oPayload).then(() => {
              MessageBox.success(this.getText("msgSuccessProd"), {
                action: [sap.m.MessageBox.Action.CLOSE],
                onClose: () => {
                  this.navTo("RouteHome");
                },
              });
            });
          } catch (error) {
            console.error(error);
            MessageBox.error(error.message);
          } finally {
            this.setBusy(false);
          }
        }
      },
    });
  },
);
