define(["jquery", "text!./style.css"], function ($, cssContent) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties: {
			version: 1.1,
			qListObjectDef: {
				qShowAlternatives: true,
				qFrequencyMode: "V",
				qInitialDataFetch: [{
					qWidth: 1,
					qHeight: 150
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimension: {
					type: "items",
					translation: "Dimension",
					ref: "qListObjectDef",
					min: 1,
					max: 1,
					items: {
						label: {
							type: "string",
							ref: "qListObjectDef.qDef.qFieldLabels.0",
							translation: "Label",
							show: true
						},
						libraryId: {
							type: "string",
							component: "library-item",
							libraryItemType: "dimension",
							ref: "qListObjectDef.qLibraryId",
							translation: "Dimension",
							show: function (data) {
								return data.qListObjectDef && data.qListObjectDef.qLibraryId;
							}
						},
						field: {
							type: "string",
							expression: "always",
							expressionType: "dimension",
							ref: "qListObjectDef.qDef.qFieldDefs.0",
							translation: "Field",
							show: function (data) {
								return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
							}
						}
						// frequency: {
						// 	type: "string",
						// 	component: "dropdown",
						// 	label: "Frequency mode",
						// 	ref: "qListObjectDef.qFrequencyMode",
						// 	options: [{
						// 		value: "N",
						// 		label: "No frequency"
						// 	}, {
						// 		value: "V",
						// 		label: "Absolute value"
						// 	}, {
						// 		value: "P",
						// 		label: "Percent"
						// 	}, {
						// 		value: "R",
						// 		label: "Relative"
						// 	}],
						// 	defaultValue: "V"
						// }
					}
				},
				// sorting: {
				//   uses: "sorting"
				// },
				settings: {
					uses: "settings",
					items: {
						options: {
							type: "items",
							label: "Options",
							items: {
								orientation: {
									type: "string",
									component: "radiobuttons",
									label: "Orientation",
									ref: "orientation",
									options: [{
										value: "O",
										label: "One Row"
									}, {
										value: "M",
										label: "Multiple Rows"
									}],
									defaultValue: "M"
								},
								onjtype: {
									type: "string",
									component: "radiobuttons",
									label: "Object Type",
									ref: "objtype",
									options: [{
										value: "C",
										label: "Checkbox"
									}, {
										value: "R",
										label: "Radio"
									}, {
										value: "B",
										label: "Button"
									}],
									defaultValue: "R"
								},
								multiple: {
									type: "boolean",
									label: "Toggle select",
									ref: "multiple",
									defaultValue: false
								},
								defaultvalue: {
									type: "string",
									label: "Default selected value",
									ref: "defaultselection"
								},
								btnactive: {
									type: "string",
									label: "Active style (css)",
									ref: "btnactive",
									defaultValue: "font-weight: bold; border: 1;"
								},
								btninactive: {
									type: "string",
									label: "InActive style  (css)",
									ref: "btninactive",
									defaultValue: "border: 0;"
								}
							}
						},
						about: {
							type: "items",
							label: "About",
							items: {
								btninactive: {
									type: "string",
									label: "stefan.stoichev@gmail.com",
									ref: "about",
									defaultValue: "https://github.com/countnazgul/Qlik-Sense-Filter-Extension"
								}
							}
						}
					}
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ($element, layout) {
			var self = this, html = "";
			var data = [];
			var selected = 0;
			var defaultvalue = null;
			var defaultselectionList = layout.defaultselection.split(',');
			var selectValues = [];

			this.backendApi.eachDataRow(function (rownum, row) {
				if (row[0].qState === 'S') {
					selected = 1;
				}
				data.push(row[0]);
			});

			data.sort(function (a, b) { return parseInt(a.qNum) - parseInt(b.qNum) });

			for (var i = 0; i < data.length; i++) {
				var checked = '';
				var text = data[i].qText;

				for (var v = 0; v < defaultselectionList.length; v++) {
					if (data[i].qText == defaultselectionList[v]) {
						selectValues.push( data[i].qElemNumber );
					}
				}
				// if (data[i].qText == layout.defaultselection) {
				// 	defaultvalue = data[i];
				// }

				var orientation = '';
				if (layout.orientation === undefined) {
					orientation = '</br>';
				} else if (layout.orientation === 'M') {
					orientation = '</br>';
				} else {
					orientation = '&nbsp;&nbsp;';
				}

				var objtype = '';
				if (layout.objtype === undefined) {
					objtype = 'radio';
				} else if (layout.objtype === 'R') {
					objtype = 'radio';
				} else if (layout.objtype === 'C') {
					objtype = 'checkbox';
				} else {
					objtype = 'button';
				}

				if (data[i].qState === "S") {
					if (objtype != 'button') {
						checked = ' checked ';
						text = '<strong>' + data[i].qText + '</strong>';
					} else {
						text = data[i].qText;
					}
				}

				var style = '';
				if (layout.btnactive === undefined) {
					style = "font-weight: bold; border: 1;";
				} else {
					style = layout.btnactive;
				}

				if (data[i].qState === "S") {
					style = ' style="' + style + '"';
				} else {
					style = ' style="' + layout.btninactive + '"';
				}

				if (objtype != 'button') {
					html += '<input type="' + objtype + '" name="' + layout.qInfo.qId + '" ' + checked + ' class="data state' + data[i].qState + '" data-value="'
						+ data[i].qElemNumber + '"><label ' + style + '>' + text + '</label>' + orientation;
				} else {
					html += '<input ' + style + '  type="' + objtype + '" name="' + layout.qInfo.qId + ' class="data state' + data[i].qState + '" data-value="'
						+ data[i].qElemNumber + '" value="' + text + '"> ' + orientation;
				}
			}

			if (selected === 0) {
				if (selectValues.length != null) {
					self.backendApi.selectValues(0, selectValues /*[defaultvalue.qElemNumber]*/, true);
				}
			}

			$element.html(html);
			if (this.selectionsEnabled) {
				$element.find('input').on('qv-activate', function () {
					if (this.hasAttribute("data-value")) {
						var value = parseInt(this.getAttribute("data-value"), 10), dim = 0;
						if (layout.multiple === false) {
							self.backendApi.selectValues(dim, [value], false);
						} else {
							self.backendApi.selectValues(dim, [value], true);
						}
						$(this).toggleClass("selected");
					}
				});
			}
		}
	};
});
