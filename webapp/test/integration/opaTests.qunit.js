/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["testlista/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
