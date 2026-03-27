sap.ui.define(["./BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("testlista.controller.App", {
    onInit() {},
    onSideNavButtonPress: function () {
      const oToolPage = this.byId("toolPage");
      const bSideExpanded = oToolPage.getSideExpanded();

      oToolPage.setSideExpanded(!bSideExpanded);
    },

    onNavToProductsList: function (oEvent) {
      this.navTo("RouteProductsList");
    },

    onNavToOrdersList: function (oEvent) {
      this.navTo("RouteOrdersList");
    },

    onNavToDashboard: function (oEvent) {
      this.navTo("RouteDashboard");
    },
  });
});
