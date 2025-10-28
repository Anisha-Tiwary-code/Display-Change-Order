/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/reckitt/zpedisplaychangeorder/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.reckitt.zpedisplaychangeorder.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.setModel(models.createLocalHeaderModel(),"locHeaderModel");

                this.setModel(models.createComponentJSONModel(), "componentJSONModel");
                this.setModel(models.createComponentOverviewModel(),"locComponentModel");

                this.setModel(models.createOperationJSONModel(),"operationJSONModel");
                this.setModel(models.createOperationOverviewModel(),"locOperationModel");

                //for navigation from work-to-list app
                this.setModel(models.createoAppStateModel(), "oAppStateModel");
            }
        });
    }
);