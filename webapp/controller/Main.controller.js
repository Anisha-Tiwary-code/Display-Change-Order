sap.ui.define([
    "./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/ValueState",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Controller, Fragment, JSONModel, MessageBox, ValueState, Filter, FilterOperator, Sorter) {
        "use strict";
        var oRes;
        var scheduledStartDate = "";
        var scheduledStartTime = "";
        var scheduledEndDate = "";
        var scheduledEndTime = "";

        var decimalNotation = ""; //X- 1,234,567.89, Y- 1 234 567,89, Z- 1.234.567,89

        return BaseController.extend("com.reckitt.zpedisplaychangeorder.controller.Main", {
            onInit: function () {
                oRes = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.getView().byId("idOrderDetailsTabContainer");
                
                let headerData = this.getOwnerComponent().getModel("locHeaderModel").getData();

                // //Read url parameters if order number is passed from work-to-list app
                // let oComponentData = this.getOwnerComponent().getComponentData();
                // if(oComponentData && oComponentData.startupParameters &&
                //     oComponentData.startupParameters.orderNumber) { 
                //      var workOrder = oComponentData.startupParameters.orderNumber[0];
                        
                //      headerData.orderNumber = workOrder;
                //      headerData.orderEditable = false;

                //      //if order number is passed from work-to-list app, call the method
                //      //to load order details.
                //      this.onPressGo();
                // }else{
                //     headerData.orderEditable = true;
                // }
            
                headerData.orderEditable = true;
                this.getOwnerComponent().getModel("locHeaderModel").refresh();

                this.getView().byId("idColAvailable").setVisible(false);
                this.getView().byId("idLblAvailable").setVisible(false);

                // this.getView().byId("idIconAvailabilityChk").setVisible(false);

                // this.getView().byId("idAvailabilityCheck").setVisible(false);
                
                // sap.ui.core.IconPool.getIconURI();


                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.attachRouteMatched(this._onObjectMatched, this);

            },


            /**
             * Method gets called from onInit() upon navigation from work-to-list app
             * Other config settings are in manifest.json and Component.js
             * @param {*} oEvent 
             */
            _onObjectMatched: function (oEvent) {
                if (oEvent.getParameter("arguments").Aufnr === undefined) {} else {
                    var t = this;
                    var Aufnr = oEvent.getParameter("arguments").Aufnr;
                    if (Aufnr) {

                        this.getView().byId("radioBtnDisplayOrder").setSelected(true);
                        this.onSelectApplicationType();

                        t.getOwnerComponent().getModel("locHeaderModel").setProperty("/orderNumber", Aufnr);

                        


                        // t.getOwnerComponent().getModel("AppModeModel").refresh();
                        var sHashChanger = new sap.ui.core.routing.HashChanger();
                        var sHash = sHashChanger.getHash();
                        if (sHash !== "undefined" && sHash !== "") {
                                var sAppStateKeys = /(?:sap-xapp-state=)([^&=]+)/.exec(sHash);
                                    if (sAppStateKeys !== null) {
                                        var sAppStateKey = sAppStateKeys[1];
                                        t.getOwnerComponent().getModel("locHeaderModel").setProperty("/appStateKey", sAppStateKey);
                                        sap.ushell.Container
                                            .getService("CrossApplicationNavigation")
                                            .getAppState(this.getOwnerComponent(), sAppStateKey)
                                            .done(function (oSavedAppState) {
                                                this.getView().getModel("oAppStateModel").setData(oSavedAppState.getData());
                                                                }.bind(this));
                                    }
                        }

                        this.onPressGo();
            
                    }
     
                }
            },

            //Method called when user toggles between Display order & Change order
            //Created on 15 Jan 2024

            onSelectApplicationType: function(event){
                //Set locHeaderModel field changeOrderAppVisibility based on 
                //Display or Change Order app type
                var headerData = this.getView().getModel("locHeaderModel").getData();
                //headerData.changeOrderAppVisibility = "true";

                if(event !== undefined){
                    var index = event.getParameter("selectedIndex");
                    var appType = event.getSource().getButtons()[index].getText();
                }else{
                    //If navigation is from work-to-list app, the function onSelectApplicationType
                    //is called in  _onObjectMatched() function

                    var index = 0;
                    var appType = oRes.getText("lblDisplayOrderApp");
                }

                

                headerData.isAppTypeSelected = true;
                decimalNotation = "";
                headerData.enableButtons = false; //enable Change order buttons only after header data is loaded

                headerData.enableReprintButton = false;

                if(appType && appType === oRes.getText("lblChangeOrderApp")){
                    var headerData = this.getView().getModel("locHeaderModel").getData();
                    headerData.changeOrderAppVisibility = true;

                    headerData.appType = oRes.getText("lblChangeOrderApp");
                }else{
                    headerData.changeOrderAppVisibility = false;

                    headerData.appType = oRes.getText("lblDisplayOrderApp");
                }
                

                this.getView().byId("idColAvailable").setVisible(false);
                this.getView().byId("idLblAvailable").setVisible(false);
                // this.getView().byId("idAvailabilityCheck").setVisible(false);

                this.clearHeaderData();//to clear the loaded data

                //clear the Component overview and Operation overview data
                this.getView().getModel("componentJSONModel").setData([]);
                this.getView().getModel("componentJSONModel").refresh();
                this.getView().getModel("locComponentModel").setData([]);
                this.getView().getModel("locComponentModel").refresh();

                
                this.getView().getModel("operationJSONModel").setData([]);
                this.getView().getModel("operationJSONModel").refresh();
                this.getView().getModel("locOperationModel").setData([]);
                this.getView().getModel("locOperationModel").refresh();


                this.getView().getModel("locHeaderModel").refresh();

            },
            /*	Method: onScanOrder
             *	Created By: IBM Fiori Team      	|Created On: Jan 15 2024
             *	Last updated: IBM Fiori Team      	|Updated On: 
             *	Description/Usage: Method is for Scanning the order number
             */
             onScanOrder: function () {
                var updModel = this.getOwnerComponent().getModel("locHeaderModel");
                var updProperty = "orderNumber";
                this.fnScanBarCode(updModel, updProperty);
            },

            /**
             * Method created by IBM Fiori Team 
             * on 07-03-2024
             * Method is called when user presses Go button
             */
            onPressGo: function(){
                var prodOrderModel = this.getOwnerComponent().getModel("prodOrderModel");

                 
                 var locHeaderModel = this.getOwnerComponent().getModel("locHeaderModel");
                 var headerData  = locHeaderModel.getData();
                 var workOrder = headerData.orderNumber;//10010713
 

                var aFilters = [];

                //pass order number (Aufnr) as filter
                aFilters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, workOrder));
                   
                // Read Order Header data EntitySet 
                prodOrderModel.read("/ProdOrderHdrSet", {
                            filters: aFilters,
                            success: $.proxy(function (oRetrievedResult) {
                                // console.log(oRetrievedResult.results[0]);    
                                headerData.orderType = oRetrievedResult.results[0].Auart;
                                headerData.plant = oRetrievedResult.results[0].Werks;
                                headerData.material = oRetrievedResult.results[0].Matnr;
                                headerData.materialDesc = oRetrievedResult.results[0].Matxt;
                                headerData.status = oRetrievedResult.results[0].Sttxt;
                                headerData.userStatus = oRetrievedResult.results[0].Asttx;
                                headerData.totalQty = oRetrievedResult.results[0].Gamng;
                                headerData.deliveredQty = oRetrievedResult.results[0].Gwemg;
                                headerData.uom = oRetrievedResult.results[0].Gmein;

                                headerData.scheduledStartDtTime = oRetrievedResult.results[0].Gstrs;
                                headerData.scheduledEndDtTime = oRetrievedResult.results[0].Gltrs;

                                if(headerData.scheduledStartDtTime){
                                    scheduledStartDate = oRetrievedResult.results[0].Gstrs;
                                    headerData.scheduledStartDtTime = headerData.scheduledStartDtTime.toLocaleString(oRes.getText("localeCode"), {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    });
                                }

                                if(headerData.scheduledEndDtTime){
                                    scheduledEndDate = oRetrievedResult.results[0].Gltrs;
                                    headerData.scheduledEndDtTime = headerData.scheduledEndDtTime.toLocaleString(oRes.getText("localeCode"), {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    });
                                }

                                
                                // console.log("Start time "+oRetrievedResult.results[0].Gsuzs);
                                // console.log("End time "+oRetrievedResult.results[0].Gluzs);

                                if(oRetrievedResult.results[0].Gsuzs){
                                    scheduledStartTime = oRetrievedResult.results[0].Gsuzs;
                                    var startTime = this.convertMillisecondstoTime(oRetrievedResult.results[0].Gsuzs.ms);   
                                }

                                if(oRetrievedResult.results[0].Gluzs){
                                    scheduledEndTime = oRetrievedResult.results[0].Gluzs;
                                    var endTime = this.convertMillisecondstoTime(oRetrievedResult.results[0].Gluzs.ms);   
                                }

                                headerData.scheduledStartDtTime = headerData.scheduledStartDtTime + " "+startTime;
                                headerData.scheduledEndDtTime = headerData.scheduledEndDtTime+" "+endTime;

                                decimalNotation = oRetrievedResult.results[0].Dcpfm;
                                

                                this.getComponentOverviewEntitySet();
                                this.getOperationOverviewEntitySet();


                                if(headerData.appType===oRes.getText("lblChangeOrderApp")){

                                    var statusCreated = oRes.getText("orderStatusCreated");
                                    var statusTeco = oRes.getText("orderStatusTeco");

                                    headerData.changeOrderAppVisibility = true;
                                    headerData.enableButtons = true;

                                    //Disable reprint button for Order status CRTD and TECO  - defect fix - 28-03-2024
                                    if(headerData.status.includes(statusCreated) || headerData.status.includes(statusTeco)){
                                        headerData.enableReprintButton = false;
                                    }else{
                                        headerData.enableReprintButton = true;
                                    }
                                }else{
                                    headerData.changeOrderAppVisibility = false;
                                    headerData.enableButtons = false;
                                    headerData.enableReprintButton = false;
                                }
                            
                                locHeaderModel.refresh();

                            // Aufnr	Order
                            // Auart	Order Type
                            // Matnr	Material
                            // Matxt	Mat. descriptn
                            // Werks	Plant
                            // Sttxt	System Status
                            // Asttx	User Status
                                
                            // Gmein	Unit of measure
                            // Gstrs	Sched. start
                            // Gsuzs	SchedStartTime
                            // Gltrs	Sched. finish
                            // Gluzs	Finish time

                            // Gwemg   Delivered qty
                            // Gamng Total Order quantity

            
                        }, this),
                        error: $.proxy(function (oError) {
                            sap.ui.core.BusyIndicator.hide();
                            
                            if (oError.responseText) {
                                var response = JSON.parse(oError.responseText);
                                var errorList = response.error.innererror.errordetails;
                                var errorMsgs = [];
                                var ERROR = "";
                                for (var i = 0; i < errorList.length; i++) {
                                    errorMsgs.push(errorList[i].message);
                                    ERROR = ERROR + errorList[i].message + "\n";
                                }
                                MessageBox.error(ERROR);
                            }

                            

                        }, this)

                    })



            },


            getComponentOverviewEntitySet: function(){

                //Models are defined in Component.js and manifest.json
                var headerData = this.getView().getModel("locHeaderModel").getData();
                var componentJSONModel = this.getView().getModel("componentJSONModel");

                var prodOrderModel = this.getView().getModel("prodOrderModel");
                var aFilters = [];
                var workOrder = headerData.orderNumber;
                aFilters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, workOrder));


                prodOrderModel.read("/ProdOrderCompSet", {
                    filters: aFilters,
                    
                    success: $.proxy(function (oRetrievedResult) {
                        sap.ui.core.BusyIndicator.hide();
                        componentJSONModel.setData(oRetrievedResult.results);

                        // this.onPressCheckMaterialAvailability();
                        componentJSONModel.refresh();
                        
                    }, this),
                    error: $.proxy(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        this.getView().getModel("componentJSONModel").setData([]);
                        this.getView().getModel("componentJSONModel").refresh();
                        this.getView().getModel("locComponentModel").setData([]);
                        this.getView().getModel("locComponentModel").refresh();
                        if (oError.responseText) {
                            var response = JSON.parse(oError.responseText);
                            var errorList = response.error.innererror.errordetails;
                            var errorMsgs = [];
                            var ERROR = "";
                            for (var i = 0; i < errorList.length; i++) {
                                errorMsgs.push(errorList[i].message);
                                ERROR = ERROR + errorList[i].message + "\n";
                            }
                            MessageBox.error(ERROR);
                        }
                    }, this)
                });

                // let oSorter = new sap.ui.model.Sorter("Matxt",false);
                // let aSorter = [];

                // aSorter.push(oSorter);

                // let oTable = this.byId("idCompOverviewTable");
                // let oBinding = oTable.getBinding("items");
                // // oBinding.sort(aSorter);



            },

            getOperationOverviewEntitySet: function(){
                //Models are defined in Component.js and manifest.json
                var headerData = this.getView().getModel("locHeaderModel").getData();
                var operationJSONModel = this.getView().getModel("operationJSONModel");

                var prodOrderModel = this.getView().getModel("prodOrderModel");
                var aFilters = [];
                var workOrder = headerData.orderNumber;
                aFilters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, workOrder));


                prodOrderModel.read("/ProdOrderOperSet", {
                    filters: aFilters,
                    
                    success: $.proxy(function (oRetrievedResult) {
                        sap.ui.core.BusyIndicator.hide();
                        operationJSONModel.setData(oRetrievedResult.results);
                        operationJSONModel.refresh();
                        
                    }, this),
                    error: $.proxy(function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        this.getView().getModel("operationJSONModel").setData([]);
                        this.getView().getModel("operationJSONModel").refresh();
                        this.getView().getModel("locOperationModel").setData([]);
                        this.getView().getModel("locOperationModel").refresh();
                        if (oError.responseText) {
                            var response = JSON.parse(oError.responseText);
                            var errorList = response.error.innererror.errordetails;
                            var errorMsgs = [];
                            var ERROR = "";
                            for (var i = 0; i < errorList.length; i++) {
                                errorMsgs.push(errorList[i].message);
                                ERROR = ERROR + errorList[i].message + "\n";
                            }
                            MessageBox.error(ERROR);
                        }
                    }, this)
                });
            },
            
            convertMillisecondstoTime: function(ms){
                let timeVal = "";
                const pad = (i) => (i < 10) ? "0" + i : "" + i;

                    if(ms >=0 ){
                            // 1- Convert to seconds:
                            let seconds = ms / 1000;
                            // 2- Extract hours:
                            const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
                            seconds = seconds % 3600; // seconds remaining after extracting hours
                            // 3- Extract minutes:
                            const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
                            // 4- Keep only seconds not extracted to minutes:
                            seconds = seconds % 60;
                            // console.log("PT"+hours+"H : "+minutes+"M : "+seconds+"S");
                            timeVal = pad(hours)+":"+pad(minutes)+":"+pad(seconds);
                        }

                    return timeVal;

                    // alert( hours+":"+minutes+":"+seconds);
                
                
            },

            //Method called when user changes Order number
            //Created by IBM fiori team SM15
            //On 11-03-2024

            onChangeOrderNumber: function(){
                this.clearHeaderData();

                this.getView().getModel("componentJSONModel").setData([]);
                this.getView().getModel("componentJSONModel").refresh();
                this.getView().getModel("locComponentModel").setData([]);
                this.getView().getModel("locComponentModel").refresh();

                
                this.getView().getModel("operationJSONModel").setData([]);
                this.getView().getModel("operationJSONModel").refresh();
                this.getView().getModel("locOperationModel").setData([]);
                this.getView().getModel("locOperationModel").refresh();

                //set visibility of Available column in Component overview to false

                this.getView().byId("idColAvailable").setVisible(false);
                this.getView().byId("idLblAvailable").setVisible(false);
                // this.getView().byId("idAvailabilityCheck").setVisible(false);



            },

            //This method is to clear all Header Data if order number is changed
            clearHeaderData: function(){

                // this.getOwnerComponent().getModel("message").setData([]);
                var headerModel = this.getView().getModel("locHeaderModel");
                var headerData = headerModel.getData();
                headerData.orderType="";     
                headerData.material="";
                headerData.materialDesc="";
                headerData.plant="";
                headerData.status="";
                headerData.userStatus="";
                headerData.totalQty="";
                headerData.deliveredQty="";
                headerData.uom="";

                headerData.scheduledStartDtTime = "";
                headerData.scheduledEndDtTime="";

                headerData.enableButtons = false;

                headerData.enableReprintButton = false;
                
                // headerData.changeOrderAppVisibility = false;

                headerModel.refresh();

                // this.getView().getModel("goodsItemJSONModel").setData([]);
                // this.getView().getModel("goodsItemJSONModel").refresh();
                // this.getView().getModel("locGoodsItemModel").setData([]);
                // this.getView().getModel("locGoodsItemModel").refresh();
            },


            /**
             * Method called to calculate Availability check and display
             * red cross icon is displayed if Committed Qty less than Required Qty
             * Else green tick is displayed in Available column.
             */
            onPressCheckMaterialAvailability: function(){
                

                // this.getView().byId("idIconAvailabilityChk").setVisible(true);

                this.getView().byId("idColAvailable").setVisible(true);
                this.getView().byId("idLblAvailable").setVisible(true);
                // this.getView().byId("idIconAvailabilityChk").setVisible(true);

                // this.getView().byId("idAvailabilityCheck").setVisible(true);

                this.getView().getModel("componentJSONModel").refresh();

                 //Models are defined in Component.js and manifest.json
                 var headerData = this.getView().getModel("locHeaderModel").getData();
                 var componentJSONModel = this.getView().getModel("componentJSONModel");
 
                 var prodOrderModel = this.getView().getModel("prodOrderModel");
                 var aFilters = [];
                 var workOrder = headerData.orderNumber;

                 var okCode = "MAT";

                 aFilters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, workOrder));
                 aFilters.push(new sap.ui.model.Filter("OkCode", sap.ui.model.FilterOperator.EQ, okCode));
 
 
                 prodOrderModel.read("/ProdOrderCompSet", {
                     filters: aFilters,
                     
                     success: $.proxy(function (oRetrievedResult) {
                         sap.ui.core.BusyIndicator.hide();
                         componentJSONModel.setData(oRetrievedResult.results);
 
                         // this.onPressCheckMaterialAvailability();
                         componentJSONModel.refresh();

                         this.calculateMaterialAvailability();
                         
                     }, this),
                     error: $.proxy(function (oError) {
                         sap.ui.core.BusyIndicator.hide();
                         this.getView().getModel("componentJSONModel").setData([]);
                         this.getView().getModel("componentJSONModel").refresh();
                         this.getView().getModel("locComponentModel").setData([]);
                         this.getView().getModel("locComponentModel").refresh();
                         if (oError.responseText) {
                             var response = JSON.parse(oError.responseText);
                             var errorList = response.error.innererror.errordetails;
                             var errorMsgs = [];
                             var ERROR = "";
                             for (var i = 0; i < errorList.length; i++) {
                                 errorMsgs.push(errorList[i].message);
                                 ERROR = ERROR + errorList[i].message + "\n";
                             }
                             MessageBox.error(ERROR);
                         }
                     }, this)
                 });

                

            },

            /** Method to calculate material availability after user presses
             * Check Material Availability button 
             * 
             */
            calculateMaterialAvailability: function(){

                //Loop through component overview data

                var decNotation = ".";

                if(decimalNotation && decimalNotation === 'X'){
                    decNotation = ".";
                }else if(decimalNotation && decimalNotation === 'Y'){
                    decNotation = ",";
                }else if(decimalNotation && decimalNotation === 'Z'){
                    decNotation = ",";
                }
                var components = this.getView().getModel("componentJSONModel").getData();

                if (components.length > 0) {
                    let itemPosition = 0;
                    components.forEach(function (object) {

                            object.Available = 'N';
                            itemPosition++;
                            let requirementQty = object.Menge;
                            let committedQty = object.Dvmeng;

                            //Based on Decimal notation - remove the dot or comma
                            // var array = '123.2345.34'.split(/\.(?=[^\.]+$)/);
                            // console.log(array);
                            // committedQty.split('.').join("");

                            if(decNotation===','){
                                committedQty = committedQty.replaceAll(".","");
                                committedQty = committedQty.replaceAll(",",".");

                                requirementQty = requirementQty.replaceAll(".","");
                                requirementQty = requirementQty.replaceAll(",",".");
                            }else if(decNotation === '.'){
                                committedQty = committedQty.replaceAll(",","");

                                requirementQty = requirementQty.replaceAll(",","");
                            }

                            if(Number(committedQty)== 0 || Number(requirementQty) == 0 || (Number(committedQty) && Number(requirementQty))){
                                object.Available = (Number(committedQty) - Number(requirementQty))>=0?'Y':'N';
                            }
                    })
                } 
                
                this.getView().getModel("componentJSONModel").refresh();

            },

            /**
             * Method called when Release Order button is clicked 
             * Created on 18-03-2024
             */
            onReleaseOrder: function(){
                var prodOrderModel = this.getOwnerComponent().getModel("prodOrderModel");

                 
                var locHeaderModel = this.getOwnerComponent().getModel("locHeaderModel");
                var headerData  = locHeaderModel.getData();
                var workOrder = headerData.orderNumber;//10010713
 

                
                // Aufnr	Order
                // Auart	Order Type
                // Matnr	Material
                // Matxt	Mat. descriptn
                // Werks	Plant
                // Sttxt	System Status
                // Asttx	User Status
                    
                // Gmein	Unit of measure
                // Gstrs	Sched. start
                // Gsuzs	SchedStartTime
                // Gltrs	Sched. finish
                // Gluzs	Finish time

                // Gwemg   Delivered qty
                // Gamng Total Order quantity

                if(!(workOrder) || (workOrder.trim().length == 0)){
                    MessageBox.error(oRes.getText("msgPleaseenterOrderNumber"));
                }else{


                    var releasePayload = {
                        "OkCode": 'REL',
                        "Aufnr": workOrder,
                        "Auart": headerData.orderType,
                        "Matnr":headerData.material,
                        "Matxt":headerData.materialDesc,
                        "Werks":headerData.plant,
                        "Sttxt":headerData.status,
                        "Asttx":headerData.userStatus,
                        "Gmein":headerData.uom,
                        "Gstrs": scheduledStartDate,
                        "Gsuzs": scheduledStartTime,
                        "Gltrs": scheduledEndDate,
                        "Gluzs":scheduledEndTime,
                        "Gwemg":headerData.deliveredQty,
                        "Gamng":headerData.totalQty
                        
                    }

                    // Create Order Header data EntitySet 
                    prodOrderModel.create("/ProdOrderHdrSet", releasePayload, {
                            
                        success: $.proxy(function (oRetrievedResult) {
                            //console.log(oRetrievedResult);    

                            if(oRetrievedResult){
                                let orderReleased = oRetrievedResult.Stat;
                                if(orderReleased && orderReleased === 'REL'){
                                    MessageBox.success(oRes.getText("lblOrder")+" "+workOrder+" "+oRes.getText("msgOrderReleased"));
                                    //refresh the status to Released
                                    headerData.status = oRetrievedResult.Sttxt;
                                    locHeaderModel.refresh();
                                } 

                                
                            }
                            // this.getComponentOverviewEntitySet();
                            // this.getOperationOverviewEntitySet();
                                
                            }, this),
                            error: $.proxy(function (oError) {
                                sap.ui.core.BusyIndicator.hide();
                                
                                if (oError.responseText) {
                                    var response = JSON.parse(oError.responseText);
                                    var errorList = response.error.innererror.errordetails;
                                    var errorMsgs = [];
                                    var ERROR = "";
                                    for (var i = 0; i < errorList.length; i++) {
                                        errorMsgs.push(errorList[i].message);
                                        ERROR = ERROR + errorList[i].message + "\n";
                                    }
                                    MessageBox.error(ERROR);
                                }

                            }, this)

                        });
                    }

            },

            /**
             * 
             * @param {*} oEvent 
             */

            onReprint: function(){

                var prodOrderModel = this.getOwnerComponent().getModel("prodOrderModel");

                var locHeaderModel = this.getOwnerComponent().getModel("locHeaderModel");
                var headerData  = locHeaderModel.getData();
                var workOrder = headerData.orderNumber;
 

                
                // Aufnr	Order
                // Auart	Order Type
                // Matnr	Material
                // Matxt	Mat. descriptn
                // Werks	Plant
                // Sttxt	System Status
                // Asttx	User Status
                    
                // Gmein	Unit of measure
                // Gstrs	Sched. start
                // Gsuzs	SchedStartTime
                // Gltrs	Sched. finish
                // Gluzs	Finish time

                // Gwemg   Delivered qty
                // Gamng Total Order quantity

                if(!(workOrder) || (workOrder.trim().length == 0)){
                    MessageBox.error(oRes.getText("msgPleaseenterOrderNumber"));
                }else{


                    var printPayload = {
                        "OkCode": 'PRN',
                        "Aufnr": workOrder,
                        "Auart": headerData.orderType,
                        "Matnr":headerData.material,
                        "Matxt":headerData.materialDesc,
                        "Werks":headerData.plant,
                        "Sttxt":headerData.status,
                        "Asttx":headerData.userStatus,
                        "Gmein":headerData.uom,
                        "Gstrs": scheduledStartDate,
                        "Gsuzs": scheduledStartTime,
                        "Gltrs": scheduledEndDate,
                        "Gluzs":scheduledEndTime,
                        "Gwemg":headerData.deliveredQty,
                        "Gamng":headerData.totalQty
                        
                    }

                    // Create Order Header data EntitySet 
                    prodOrderModel.create("/ProdOrderHdrSet", printPayload, {
                            
                        success: $.proxy(function (oRetrievedResult) {
                            // console.log(oRetrievedResult);    

                            if(oRetrievedResult){
                                if(oRetrievedResult.Natxt){

                                    // let printSuccess = (oRetrievedResult.Natxt+". ") +oRes.getText("lblOrder")+ " " +
                                    //                     workOrder+" " +oRes.getText("msgOrderPrint");

                                    MessageBox.success(oRetrievedResult.Natxt+". ");
                                }

                            }
                          
                                
                            }, this),
                            error: $.proxy(function (oError) {
                                sap.ui.core.BusyIndicator.hide();
                                
                                if (oError.responseText) {
                                    var response = JSON.parse(oError.responseText);
                                    var errorList = response.error.innererror.errordetails;
                                    var errorMsgs = [];
                                    var ERROR = "";
                                    for (var i = 0; i < errorList.length; i++) {
                                        errorMsgs.push(errorList[i].message);
                                        ERROR = ERROR + errorList[i].message + "\n";
                                    }
                                    MessageBox.error(ERROR);
                                }

                            }, this)

                        });
                    }

            },

            /** Method added on 23-01-2024 - SM15
            **  Called when user tries to close the tab by clicking on close icon
            */
            onTabClose: function(oEvent){
                // prevent the tab being closed by default
				oEvent.preventDefault();
            }
        });
    });
