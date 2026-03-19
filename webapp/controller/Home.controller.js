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

      onDeleteProducts: async function (oEvent) {
        async function deleteProducts() {
          const sProdCode = oEvent.getSource().getParent().getBindingContext("Products").getObject().CodArticolo;
          console.log(sProdCode, "sprocode");
          this.setBusy(true);

          try {
            await this.deleteEntity("/ZES_articoliSet", { CodArticolo: sProdCode }).then(async () => {
              this.setBusy(true);

              try {
                await this.onLoadProducts();
                MessageBox.success(this.getText("msgDelete"));
              } catch (error) {
                console.error(error);
                MessageBox.error(error.message);
              } finally {
                this.setBusy(false);
              }
            });
          } catch (error) {
            console.error(error);
            MessageBox.error(error.message);
          } finally {
            this.setBusy(false);
          }
        }
        MessageBox.warning(this.getText("msgConfirmDelete"), {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: (sKey) => {
            if (sKey !== sap.m.MessageBox.Action.YES) return;

            deleteProducts.apply(this);
          },
        });
      },

      onNavToAddProducts: function (oEvent) {
        console.log("Bottone cliccato");
        this.navTo("RouteProducts");
      },

      onNavToEditProducts: function (oEvent) {
        console.log("Bottone cliccato");
        const sKey = oEvent.getSource().getParent().getBindingContext("Products").getObject().CodArticolo;
        console.log(sKey, "skey");
        this.navTo("RouteDetailProducts", { CodArticolo: sKey });
      },


    });
  },
);
