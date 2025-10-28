/* global Quagga:true */
/* eslint-disable radix */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Token",
	"sap/m/SearchField",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Fragment, ColumnListItem, Label, Token, SearchField, MessageBox) {
	"use strict";
	var scanModel, scanProperty, oResourceBundle;
	return Controller.extend("com.reckitt.zpedisplaychangeorder.controller.BaseController", {
		/*	Method: onInit
		 *	Created By: IBM Fiori Team      	|Created On: 15 Jan 2024
		 *	Last updated: IBM Fiori Team      	|
		 *	Description/Usage: Initialising controller entry ppoint
		 **/
		onInit: function () {
           
		},



        /*	Method: fnScanBarCode
		 *	Created By: IBM Fiori Team      	|Created On: 15 Jan 2024
		 *	Last updated: IBM Fiori Team      	|
		 *	Description/Usage: open Barcode Scanner to capture detail
		 **/
         fnScanBarCode: function (uModel, uProperty) {

            oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();  
			scanModel = uModel;
			scanProperty = uProperty;
			if (!this._oScanDialog) {   
				this._oScanDialog = new sap.m.Dialog({
					title: oResourceBundle.getText("lblScanbarcode"),
					contentWidth: "640px",
					contentHeight: "480px",
					horizontalScrolling: false,
					verticalScrolling: false,
					stretchOnPhone: true,
					content: [new sap.ui.core.HTML({
						id: this.createId("scanContainer"),
						content: "<div />"
					})],
					endButton: new sap.m.Button({
						text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("lblCancel"),
						press: function (oEvent) {
							this._oScanDialog.close();
						}.bind(this)
					}),
					afterOpen: function () {
						this._initQuagga(this.getView().byId("scanContainer").getDomRef()).done(function () {
							Quagga.start();
						}).fail(function (oError) {
							MessageBox.error(oError.message.length ? oError.message : (this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("lblFailedtoinitialiseQuaggawithreasoncode")+" " + oError.name), {
								onClose: function () {
									this._oScanDialog.close();
								}.bind(this)
							});
						}.bind(this));
					}.bind(this),
					afterClose: function () {
						Quagga.stop();
					}
				});
				this.getView().addDependent(this._oScanDialog);
			}
			this._oScanDialog.open();
		},
		_initQuagga: function (oTarget) {
			var oDeferred = jQuery.Deferred();
			Quagga.init({
				inputStream: {
					type: "LiveStream",
					target: oTarget,
					constraints: {
						width: {
							min: 640
						},
						height: {
							min: 480
						},
						facingMode: "environment"
					}
				},
				locator: {
					patchSize: "medium",
					halfSample: true
				},
				numOfWorkers: 2,
				frequency: 10,
				decoder: {
					readers: [{
						format: "code_128_reader",
						config: {}
					}]
				},
				locate: true
			}, function (error) {
				if (error) {
					oDeferred.reject(error);
				} else {
					oDeferred.resolve();
				}
			});
			if (!this._bQuaggaEventHandlersAttached) {
				Quagga.onProcessed(function (result) {
					var drawingCtx = Quagga.canvas.ctx.overlay,
						drawingCanvas = Quagga.canvas.dom.overlay;
					if (result) {
						if (result.boxes) {
							drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
							result.boxes.filter(function (box) {
								return box !== result.box;
							}).forEach(function (box) {
								Quagga.ImageDebug.drawPath(box, {
									x: 0,
									y: 1
								}, drawingCtx, {
									color: "green",
									lineWidth: 2
								});
							});
						}
						if (result.box) {
							Quagga.ImageDebug.drawPath(result.box, {
								x: 0,
								y: 1
							}, drawingCtx, {
								color: "#00F",
								lineWidth: 2
							});
						}
						if (result.codeResult && result.codeResult.code) {
							Quagga.ImageDebug.drawPath(result.line, {
								x: "x",
								y: "y"
							}, drawingCtx, {
								color: "red",
								lineWidth: 3
							});
						}
					}
				});
				Quagga.onDetected(function (result) {
					scanModel.setProperty("/" + scanProperty, result.codeResult.code);
					scanModel.refresh();
					if (scanProperty === "Matnr") {
						this.onSubmitMaterial();
					} else if (scanProperty === "workOrder") {
						this.onPressGoButton();
					}
					this._oScanDialog.close();
				}.bind(this));
				this._bQuaggaEventHandlersAttached = true;
			}
			return oDeferred.promise();
		}


		
 
		// status: function(Status) {
		// 	if (Status === "0") {
		// 		return "sap-icon://accept"; // use your png image here 
		// 	} else if (Status === "1") {
		// 		return "sap-icon://decline";
		// 	}
		// }
			
		


    });
});