jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require("sap.m.TablePersoController");
sap.ui.define([
	"ZNotificador/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"ZNotificador/model/formatter",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text"
], function (BaseController, JSONModel, formatter, Controller, MessageToast, MessageBox, Dialog, Button, Text) {
	"use strict";
	var Ordns;
	var Oper;

	return BaseController.extend("ZNotificador.controller.Worklist", {

		_oCatalog: null,
		_oResourceBundle: null,
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView()); //obtiene instancia del component.js asociado a la vista en donde estoy parado
			var oComponentData = sap.ui.getCore().getComponent(sComponentId).getComponentData(); //Obtiene el objeto general que contiene el objeto donde vienen los parametros
			var orderid2 = oComponentData.startupParameters.Orderid[0]; //Obtiene el objeto con los parametros y el parametro especifico
			var operation2 = oComponentData.startupParameters.Activityid[0];
			var descripcion2 = oComponentData.startupParameters.Descripcion[0];
			//var orderid2 = "000070000041";
			//var operation2 = "0010";

			this.setCabecera(orderid2, operation2, descripcion2);

			this.initDateTime();

			//Se asignan valores a variables globales
			Ordns = orderid2;
			Oper = operation2;

			//Llamamos a la función para cambiar el formato de salida
			var orderid = this.formatearCampo(orderid2);
			var operation = this.formatearCampo(operation2);

			var Ordn = this.getView().byId("Orden");
			//Ordn.setText(orderid);
			//Ordn.setVisible(false);

			var Opers = this.getView().byId("Operacion");
			//Opers.setText(operation);
			//Opers.setVisible(false);

			//Llamamos al servicio de Motivo de desviación
			//SOLO MIENTRAS POSEE 1 VENTANA
			var oSelect = this.getView().byId("__select0");
			var oItem = new sap.ui.core.ListItem({
				key: "{DevReason}",
				text: "{DevReasontx}"
			});

			var oFilter = new sap.ui.model.Filter("Orderid", sap.ui.model.FilterOperator.EQ, orderid);
			var oSorter = new sap.ui.model.Sorter("Descripdoctype", false, true);

			var config = {
				path: "/DevReasonCollectionSet",
				filters: oFilter,
				template: oItem
			};

			oSelect.bindAggregation("items", config);

			var oList = this.getView().byId("list01");
			var oItem1 = this.getView().byId("listItem01");

			var config1 = {
				path: "/OrdersFilesCollectionSet",
				filters: oFilter,
				sorter: oSorter,
				template: oItem1
			};

			oList.bindAggregation("items", config1);

			var oViewModel,
				iOriginalBusyDelay,
				//oTable = this.byId("table");

				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				//iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableBusyDelay: 0
				});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			/*			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});*/
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @public
		 */
		onNavBack: function () {
			/*var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			/*			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Navigate back to FLP home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#"
					}
				});
			}*/

			if (sap.ui.Device.system.phone) {
				this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				this.oCrossAppNav.toExternal({
					target: {
						semanticObject: "zpmfiolistord01Sem",
						action: "display"
					}
				});
				//window.history.go(-2);
			} else {
				window.history.go(-1);
			}
		},

		navToOrderList: function () {
			this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			this.oCrossAppNav.toExternal({
				target: {
					semanticObject: "zpmfiolistord01Sem",
					action: "display"
				}
			});
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Orderid")
			});
		},

		/**
		 * Sets the item count on the worklist view header
		 * @param {integer} iTotalItems the total number of items in the table
		 * @private
		 */
		_updateListItemCount: function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				this.oViewModel.setProperty("/worklistTableTitle", sTitle);
			}
		},
		onDetailSelect: function (oEvent) {

			var oTab = oEvent.getParameter("selectedKey");

			switch (oTab) {
			case "1":
				this.getView().byId("refreshAdjuntos").setVisible(true);
				this.getView().byId("save").setVisible(false);
				this.getView().byId("cancel").setVisible(false);
				return;

			case "2":
				return;

			case "3":
				return;

			case "4":
				//Limpiar variables del formulario
				/*					var oFinDate = this.byId('ExecFinDate');
				var oFinDateID = oFinDate.sId;
				var element01 = document.getElementById(oFinDateID).childNodes;
				$(element01).val("");

				var oFinTime = this.byId('ExecFinTime');
				var oFinTimeID = oFinTime.sId;
				var element02 = document.getElementById(oFinTimeID).childNodes;
				$(element02).val("");*/
				/*					$("#__xmlview1--ExecStartDate-inner").val("");
				$("#__xmlview1--ExecStartTime-inner").val("");
				$("#__xmlview1--ExecFinDate-inner").val("");
				$("#__xmlview1--ExecFinTime-inner").val("");
				$("#__xmlview1--ConfText-inner").val("");
				$("#__xmlview1--__select0-label").val("");
				$("#__xmlview1--chkId-CbBg").val("");*/
				this.getView().byId("refreshAdjuntos").setVisible(false);
				this.getView().byId("save").setVisible(true);
				this.getView().byId("cancel").setVisible(true);
				this.initDateTime();
			}
		},
		//Formatea fehca a tipo sap
		formateaFechaOdata: function (fecha) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss"
			});
			var fechaFormateada = dateFormat.format(new Date(this.getView().byId(fecha).getDateValue()));

			return fechaFormateada;
		},
		//Formatea hora a tipo sap
		formateaHoraOdata: function (hora) {
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "PTHH'H'mm'M'ss'S'"
			});
			var horaFormateada = timeFormat.format(new Date(this.getView().byId(hora).getDateValue()));

			return horaFormateada;
		},
		//Formatea campo para salida de valores numericos sin 0 a la izquierda
		formatearCampo: function (campo) {
			var parNoceros;
			parNoceros = campo.replace(/^0+/, "");

			return parNoceros;
		},
		save: function () {
			//Se asigna valores con ceros de variables globales
			var order = Ordns;
			var operation = Oper;

			var fechaInicio = this.formateaFechaOdata("ExecStartDate"); //Fecha inicio
			var horaInicio = this.formateaHoraOdata("ExecStartTime"); //Hora inicio
			var fechaFin = this.formateaFechaOdata("ExecFinDate"); //Fecha fin
			var horaFin = this.formateaHoraOdata("ExecFinTime"); //Hora fin
			var oSel = this.getView().byId("__select0").getSelectedKey(); //Motivo de desviación
			var confText = this.getView().byId("ConfText").getValue(); //Texto notificación

			var chk = this.getView().byId("chkId").getSelected(); //Notificación final
			if (chk === true) {
				chk = "X";
			} else {
				chk = "";
			}
			var that = this;

			if (this.getView().byId("ExecFinTime").getDateValue() === null) {
				MessageBox.alert("Hora Fin es obligatorio.", {
					title: "Alerta",
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			} else {
				if (this.getView().byId("ExecStartTime").getDateValue() === null) {
					MessageBox.alert("Hora Inicio es obligatorio.", {
						title: "Alerta",
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				} else {
					if (this.validaFecha(fechaInicio, fechaFin) === false) {
						MessageBox.alert("Fecha Inicio no puede ser mayor a Fecha Fin.", {
							title: "Alerta",
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					} else {
						if (this.validaHora(fechaInicio, fechaFin, horaInicio, horaFin) === false) {
							MessageBox.alert("Hora Inicio no puede ser mayor ni igual a Hora Fin.", {
								title: "Alerta",
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						} else {

							var dialog = new Dialog({
								title: "Confirmación",
								type: "Message",
								state: "Warning",
								content: new Text({
									text: "¿Recuerde que antes de notificar finalmente debe cargar los informes y adjuntos correspondientes. Desea continuar?"
								}),
								beginButton: new Button({
									text: "Guardar",
									press: function () {

										var oData = {
											"Orderid": order,
											"Operation": operation,
											"ExecStartDate": fechaInicio,
											"ExecStartTime": horaInicio,
											"ExecFinDate": fechaFin,
											"ExecFinTime": horaFin,
											"ConfText": confText,
											"DevReason": oSel,
											"FinConf": chk
										};

										//Creo instancia de servicio
										var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV/");
										oModel.create("/NotificationCollectionSet", oData, null, function () {
											MessageBox.alert("Notificación exitosa.", {
												title: "Exito",
												textDirection: sap.ui.core.TextDirection.Inherit,
												onClose: function (oAction) {
													if (chk == "X") {
														that.navToOrderList();
													} else {
														if (sap.ui.Device.system.phone) {
															window.history.go(-2);
														} else {
															history.go(-1);
														}
													}
												}
											});
											/*											var msg = "Notificación exitosa.";
											sap.m.MessageToast.show(msg);*/
										}, function (oError) {
											var oMsg = $(oError.response.body).find("message").first().text();
											MessageBox.alert("Error al notificar " + oMsg, {
												title: "Error",
												textDirection: sap.ui.core.TextDirection.Inherit
											});
										});
										//history.go(-1);
										dialog.close();
									}
								}),
								endButton: new Button({
									text: 'Cancelar',
									press: function () {
										dialog.close();
									}
								}),
								afterClose: function () {
									dialog.destroy();
								}
							});
							dialog.open();
						}
					}
				}
			}
		},

		cancel: function () {
			if (sap.ui.Device.system.phone) {
				window.history.go(-2);
			} else {
				window.history.go(-1);
			}
		},

		//Validamos que Fecha inicio no sea menor a Fecha fin
		validaFecha: function (fechaInicio, fechaFin) {
			if (fechaInicio > fechaFin) {
				return false;
			}
			return true;
		},
		//Validamos que Hora inicio no se menor a Hora fin
		validaHora: function (fechaInicio, fechaFin, horaInicio, horaFin) {
			if (fechaInicio === fechaFin && horaInicio >= horaFin) {
				return false;
			}
			return true;
		},
		onAdjuntos: function () {
			var Ordn = this.getView().byId("Orden");
			var order = Ordn.getText();

			var Opers = this.getView().byId("Operacion");
			var operation = Opers.getText();

			//Envio de datos entre aplicaciones
			this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			this.oCrossAppNav.toExternal({
				target: {
					semanticObject: "zpmfioordadj01Sem",
					action: "display"
				},
				params: {
					Orderid: order,
					Operation: operation
				}
			});
		},
		refreshAdjuntos: function () {
			this.getView().getModel().refresh(true);
		},

		cancelAdjuntos: function () {
			MessageToast.show("Eliminar adjunto");
		},

		saveAdjuntos: function () {
			MessageToast.show("Descargar adjunto");
		},

		setCabecera: function (oOrden, oOperacion, oDescripcion) {

			var Orden = this.getView().byId("Orden");
			Orden.setText(oOrden);

			var Operacion = this.getView().byId("Operacion");
			Operacion.setText(oOperacion);

			var Descripcion = this.getView().byId("Descripcion");
			Descripcion.setText(oDescripcion);
		},

		settingIcon: function (oPar) {
			switch (oPar) {
			case 'Z06':
				return "sap-icon://add-photo";
			case 'Z05':
				return "sap-icon://attachment-text-file";
			case 'Z04':
				return "sap-icon://folder";
			case 'Z03':
				return "sap-icon://nurse";
			case 'Z02':
				return "sap-icon://technical-object";
			case 'Z01':
				return "sap-icon://Chart-Tree-Map";
			}
		},

		pressItem: function (oEvent) {
			var path1 = oEvent.getSource().getBindingContext().getPath();
			var sServiceUrl = "/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV";
			var path2 = sServiceUrl + path1 + '/$value';

			var isMobile = false; //initiate as false

			var file = this.getView().getModel().getProperty(path1);
			file = file.Descripfile;
			var ext = file.substr(-3);

			if (
				/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
				.test(navigator.userAgent) ||
				/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
				.test(navigator.userAgent.substr(0, 4))) {
				isMobile = true;
			}

			if (isMobile) {
				if (ext == 'jpg') {
					var oImage = '<img style="display:none" id="imagen-' + path1 + '" src=" ' + path2 + '"></img>'; //new Image();

					var dialog = new sap.m.Dialog({
						title: 'Confirmación',
						type: 'Message',
						state: 'Warning',
						content: new sap.ui.core.HTML({
							content: oImage
						}),

						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.addButton(new sap.m.Button({
						text: "Cerrar",
						press: function () {
							dialog.close();
						}
					}));

					var dialog2 = new sap.m.BusyDialog({
						text: 'Cargando',
						showCancelButton: true
					});

					dialog.open();
					dialog2.open();

					jQuery(".sapMDialogScrollCont img")
						.on("load", function () {
							dialog2.close();
							jQuery(this).css('display', 'block');
						})
						.on('error', function () {
							jQuery(this).attr('src', 'imagen_not_found');
							dialog2.close();
						});
				} else {
					window.open(path2);
				}
			} else {
				window.open(path2);
			}
			/*			var path1 = oEvent.getSource().getBindingContext().getPath();
			var sServiceUrl = "/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV";
			
			path1 = sServiceUrl + path1 + '/$value';

			parent.window.open(path1, 'blank');*/
		},

		settingFormatDate: function (oPar) {
			return moment(oPar).format('[Ult. modif.] DD.MM.YYYY');
		},

		downloadFile: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();

			var oItem = this.getView().getModel().getProperty(sPath);

			var sURI = "/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(sURI, false);
			var html = new sap.ui.core.HTML();

			oModel.read(
				"/OrdersFilesCollectionSet(Orderid='70000051',FileId='E5DA5830C1D831F1AEED005056BC372E',Storagecategory='ZDMS_CS01')/$value",
				null,
				null, true,
				function (oData, oResponse) {
					var oData1 = oData;
				},
				function () {
					alert('Error en la conexión.');
				});
			/*			var sServiceUrl = "/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV/";
			var oConfig = {
				metadataUrlParams: {},
				json: true,
				defaultBindingMode: "TwoWay",
				defaultCountMode: "Inline",
				useBatch: true // defaultOperationMode: "Auto"
			};
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, oConfig);
			//oModel.read("/OrdersFilesCollectionSet(Orderid'" + oItem["Orderid"] + "', FileId='" + oItem["FileId"] + "',Storagecategory='" + oItem["Storagecategory"] + "')/$value", {
			oModel.read("/OrdersFilesCollectionSet(Orderid='70000051',FileId='E5DA5830C1D831F1AEED005056BC372E',Storagecategory='ZDMS_CS01')/$value", {
				success: jQuery.proxy(function(oData, response) {
					var oData1 = oData;
				}, this),
				error: function(oData, response) {
					alert('Error en la conexión.');
					console.log(oData);
				}
			});*/
		},
		/*		getGroupHeader: function (oGroup){
			return new GroupHeaderListItem( {
				title: oGroup.key,
				upperCase: false
			} );
		},*/

		initDateTime: function () {
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;

			var campoFechaInicio = this.getView().byId("ExecStartDate");
			var campoFechaFin = this.getView().byId("ExecFinDate");
			var campoHoraInicio = this.getView().byId("ExecStartTime");

			var fechaInicio;
			var horaInicio;

			var sServiceUrl = "/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			oModel.read("/CurrentDateTimeSet('X')", {
				success: jQuery.proxy(function (oData, response) {
					var oData1 = oData;
					var aux = oData.Concat;
					var yy = aux.substring(0, 4);
					var mm = aux.substring(4, 6);
					var dd = aux.substring(6, 8);
					var hh = aux.substring(8, 10);
					var min = aux.substring(10, 12);
					mm = mm - 1;
					var fecha_1 = new Date(yy, mm, dd, hh, min);

					campoFechaInicio.setDateValue(fecha_1);
					campoFechaFin.setDateValue(fecha_1);
				}, this),
				error: function (oData, response) {
					alert('Error en la conexión.');
					console.log(oData);
				}
			});
			/*var sServiceUrl = "/sap/opu/odata/sap/ZPMGW_ORDERNPM_SRV/";
			var oConfig = {
				metadataUrlParams: {},
				json: true,
				defaultBindingMode: "TwoWay",
				defaultCountMode: "Inline",
				useBatch: true // defaultOperationMode: "Auto"
			};
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, oConfig);
			oModel.read("/CurrentDateTimeSet('X')", {
				success: function(oData, response) {
					fechaInicio = moment(oData.Datum).add(3, 'h')._d;
					horaInicio = moment(oData.Uzeit.ms + TZOffsetMs)._d;

					//Seteo valores de INICIO
					campoFechaInicio.setDateValue(fechaInicio);
					campoFechaFin.setDateValue(fechaInicio);
					//campoHoraInicio.setDateValue(horaInicio);
				},
				error: function(oData, response) {
					alert('Error en la conexión.');
					console.log(oData);
				}
			});*/
		}
	});
});