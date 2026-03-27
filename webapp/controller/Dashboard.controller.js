sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";
  return BaseController.extend("testlista.controller.Dashboard", {
    onInit: function () {
      this.getRouter().getRoute("RouteDashboard").attachPatternMatched(this._onObjectMatched, this);
    },
  });
});
