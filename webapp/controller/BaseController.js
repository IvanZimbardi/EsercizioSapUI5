sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("testlista.controller.BaseController", {
  
    getModel: function(sName) {
      return getView().getModel(sName);
    },

    setModel: function(oModel, sName) {
      this.getView().setModel(oModel, sName);
      return this.getModel(sName);
    },
    

  });
});
