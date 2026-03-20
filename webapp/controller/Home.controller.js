sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
  ],
  function (BaseController, JSONModel, MessageBox, exportLibrary, Spreadsheet) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

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
            MessageToast.show("Spreadsheet export has finished");
          })
          .finally(function () {
            oSheet.destroy();
          });
      },
    });
  },
);
