/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comreckitt/zpe_display_change_order/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
