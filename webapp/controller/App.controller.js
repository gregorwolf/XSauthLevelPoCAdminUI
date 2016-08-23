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
			this._checkDiscountCode(discountCode);
		},
		
		onEnterDiscountCode: function(result) {
			var oLayout = sap.ui.xmlfragment("de.linuxdozent.gittest.adminui.view.EnterDiscountCode", this);
			
			// get the view and add the layout as a dependent. Since the layout is being put
			// into an aggregation any possible binding will be 'forwarded' to the layout.
			var oView = this.getView();
			oView.addDependent(oLayout);
			
			sap.m.MessageBox.show(oLayout, {
				icon : sap.m.MessageBox.Icon.WARNING,
				title : "Title of first MessageBox",
				actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose : this._onCloseEnterDiscountCode.bind(this),
				dialogId : "messageBoxId"
			});
		},
		
	    scanFailCallback: function(error) {
	        this._MessageToast("Scanning failed: " + JSON.stringify(error));
	    },
	    
	    _onCloseEnterDiscountCode: function(oAction) {
			if ( oAction === sap.m.MessageBox.Action.OK ) {
				/** @type sap.m.Input */
				var oDiscountCode = sap.ui.getCore().byId("discountCodeId");
				var discountCode = oDiscountCode.getValue();
				this._checkDiscountCode(discountCode);
			}
		},
		
		_checkDiscountCode: function(discountCode) {
			this.discountCode = discountCode;
			var checkUrl = "/HANAMDC/de/linuxdozent/gittest/odata/checkDiscountCode.xsjs";
			/** @type sap.ui.model.odata.ODataModel */
			this.model = this.getView().getModel();
			var token = this.model.getSecurityToken();
			/** @type sap.ui.model.json.JSONModel */
			var oModel = new sap.ui.model.json.JSONModel();
			var mHeaders = Array();
			mHeaders["X-CSRF-Token"] = token;
			var sData = "SHA256HASH=" + encodeURIComponent(discountCode);
			oModel.attachRequestCompleted(this._discountCodeRequestCompleted.bind(this));
			oModel.loadData(checkUrl, sData, true, 'GET', false, false, mHeaders);
		},
	    
	    _discountCodeRequestCompleted: function(oEvent) {
				/** @type sap.ui.model.json.JSONModel */
				var model = oEvent.getSource();
				this.discount = model.getProperty("/OUTC")[0];
				var sMessage = "The scanned code has a value of " + this.discount.DiscountValue
							+ " belongs to customer " + this.discount.UserName
							+ " redemption status " 
							+ (this.discount.Redeemed === "Y" ? 
								  "not valid. You can only cancel this action." 
								: "is valid. Do you want to redeem the code now?");
				MessageBox.show(
					sMessage, {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Discount code content",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
						onClose: this._messageBoxConfirmed.bind(this)
					}
				);
		},
		
		_messageBoxConfirmed: function(oAction) {
			if(oAction === sap.m.MessageBox.Action.YES){
				this._redeemDiscountCode();
			} else {
				this._MessageToast("Action was canceled.");
			}
		},
		
		_redeemDiscountCode: function(oAction) {
			var that = this;
			var oData = {};

			var sPath = "/DiscountCode('" + this.discount.ID + "')";
			oData.SHA256HASH = this.discountCode;

			this.model.update(sPath, oData, {
				"success": that._MessageToast("Discount code was redeemed."),
				"error": function(oError) {
					that._MessageToast("There was a problem redeeming the discount code");
				}
			});
		},
	    
	    _MessageToast: function(sMessage) {
	    	MessageToast.show(sMessage, {
    			duration: 6000
	    	});
	    } 

	});

});