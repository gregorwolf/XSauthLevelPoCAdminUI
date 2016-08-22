sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("de.linuxdozent.gittest.adminui.controller.App", {
		
		onInit : function () {
		},

		scanSuccessCallback: function(result) {
			var discountCode = result.mParameters.text;
			var checkUrl = "/HANAMDC/de/linuxdozent/gittest/odata/checkDiscountCode.xsjs";
			this.model = this.getView().getModel();
			var token = this.model.getSecurityToken();
			/** @type sap.ui.model.json.JSONModel */
			var oModel = new sap.ui.model.json.JSONModel();
			var mHeaders = Array();
			mHeaders["X-CSRF-Token"] = token;
			var oData = {};
			oData.SHA256HASH = discountCode;
			oModel.attachRequestCompleted(this._discountCodeRequestCompleted.bind(this));
			oModel.loadData(checkUrl, JSON.stringify(oData), true, 'POST', false, false, mHeaders);
		},
		
	    scanFailCallback: function(error) {
	        this._MessageToast("Scanning failed: " + JSON.stringify(error));
	    },
	    
	    _discountCodeRequestCompleted: function(oEvent) {
				/** @type sap.ui.model.json.JSONModel */
				var model = oEvent.getSource();
				this.discount = model.getProperty("/OUTC")[0];
				var sMessage = "The scanned code has a value of " + this.discount.DiscountValue
							+ " belongs to customer " + this.discount.UserName
							+ " redemption status " + this.discount.Redeemed;
				MessageBox.show(
					sMessage, {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Discount code content",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: this._messageBoxConfirmed.bind(this)
					}
				);
		},
		
		_messageBoxConfirmed: function(oAction) {
			if(oAction === sap.m.MessageBox.Action.YES){
				this._MessageToast(JSON.stringify("Discount code was redeemed."));
			} else {
				this._MessageToast(JSON.stringify("Discount code still valid."));
			}
		},
	    
	    _MessageToast: function(sMessage) {
	    	MessageToast.show(sMessage, {
    			duration: 6000
	    	});
	    } 

	});

});