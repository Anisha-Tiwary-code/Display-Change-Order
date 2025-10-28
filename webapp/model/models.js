sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
        },

            createoAppStateModel: function () {
                var omModel = new JSONModel();
                omModel.setDefaultBindingMode("TwoWay");
                return omModel;
            },

            //Method created by IBM FIORI Team 
            //on Jan 15 2024

            createLocalHeaderModel: function(){
                let locHeaderModel = new JSONModel();

                let headerItem = {
                    "isAppTypeSelected":false,//Display Order or Change order radio button selected
                    "appType":"",
                    "orderNumber":"",//Aufnr
                    "orderEditable":true,
                    "orderType": "",//Auart
				    "material": "",//Matnr
				    "materialDesc": "",//Matxt
    				"plant":"",//Werks
                    "status":"",//Sttxt
                    "userStatus":"",//Asttx
                    "totalQty":"",//Gamng
                    "deliveredQty":"",//Gwemg
                    "uom":"",//Gmein
				    "scheduledStartDtTime":"",//Gstrs , Gsuzs
                    "scheduledEndDtTime":"",//Gltrs, Gluzs
                    "changeOrderAppVisibility": false,
                    "enableButtons":false,
                    "enableReprintButton":false
                };

                locHeaderModel.setData(headerItem);
			    locHeaderModel.setDefaultBindingMode("TwoWay");
			    return locHeaderModel;

            },

            //Method created by IBM Fiori team
            //11-03-2024

            createComponentOverviewModel: function(){
                let locComponentModel = new JSONModel();

                let component = {
                    "available":false,
                    "componentNumber": "",//Matnr
				    "compDesc": "",//Matxt
    				"reqtQty":0,//Menge
                    "committedQty":0,//Dvmeng
                    "qtyWithdrawn":"",//Denmng
                    "uom":"",//Einheit
				    "operation":"",//Vornr
                    "backflush":false//Kzear
                };

                locComponentModel.setData(component);
			    locComponentModel.setDefaultBindingMode("TwoWay");
			    return locComponentModel;
            },


            createComponentJSONModel: function(){
                let componentItemJSONModel = new JSONModel();
                let oItem = [];
                componentItemJSONModel.setData(oItem);
                componentItemJSONModel.setDefaultBindingMode("TwoWay");
                return componentItemJSONModel;
            },


            /**
             * 
             * @returns 
             */
            createOperationOverviewModel: function(){
                let locOperationModel = new JSONModel();

                let operation = {
				    "operation":"",//Vornr
                    "workCenter":"",//Arbpl
                    "controlKey":"",//Steus
                    "operationShortText":"",//Ltxa1
                    "systemStatus":"",//Vsttxt
                    "operationQty":"",//Mgvrg
                    "UoM":""//Meinh
                };

                locOperationModel.setData(operation);
			    locOperationModel.setDefaultBindingMode("TwoWay");
			    return locOperationModel;
            },


            /**
             * Method to map operation overview data from ECC to JSON model
             * to display data in Operation Tab overview table
             * Created by IBM fiori team - 14-03-2024
             * @returns 
             */
            createOperationJSONModel: function(){
                let operationJSONModel = new JSONModel();
                let oItem = [];
                operationJSONModel.setData(oItem);
                operationJSONModel.setDefaultBindingMode("TwoWay");
                return operationJSONModel;
            }

    };
});