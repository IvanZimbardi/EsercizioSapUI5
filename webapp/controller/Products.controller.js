sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("testlista.controller.Products", {
      onInit() {},

      onNavToHomeProducts: function () {
        console.log("bottone cliccato");
        this.navTo("RouteHome");
      },
    });
  },
);
