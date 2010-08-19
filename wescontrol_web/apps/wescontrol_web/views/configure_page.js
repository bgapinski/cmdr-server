// ==========================================================================
// Project:   WescontrolWeb.ConfigurePage
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals WescontrolWeb */

/** @class

  (Document Your View Here)

  @extends SC.View
*/

sc_require("views/tab_button");

WescontrolWeb.ConfigurePage = SC.View.extend(
/** @scope WescontrolWeb.ConfigurePage.prototype */ {

	classNames: ["configure-page"],
	childViews: "leftBar tabBar mainView confirmReminder".w(),
	
	leftBar: SC.View.design({
		childViews: 'roomsLabel scrollView'.w(),
		layout: {left: 0, top:0, bottom: 0, width: 300},
		backgroundColor: "#EFEBE3",
		
		scrollView: SC.ScrollView.design(SC.Border, {
			borderStyle: SC.BORDER_NONE,
			hasHorizontalScroller: NO,
			layout: {top: 20, left: 0, right: 0, bottom: 0},
			contentView: SC.ListView.design({
				contentValueKey: "name",
				contentBinding: 'WescontrolWeb.buildingController.arrangedObjects',
				selectionBinding: 'WescontrolWeb.buildingController.selection',
				rowHeight: 28,
				backgroundColor: null,
				actOnSelect: YES
			}).classNames('roomList')
		}),
		
		roomsLabel: SC.LabelView.design({
			layout: {left:0, right: 0, bottom:0, height: 70},
			value: "Rooms",
			fontWeight: SC.BOLD_WEIGHT
		}).classNames('backgroundText')
	}),
	
		
	tabBar: SC.View.design({
		childViews: 'general devices sources actions preview confirm'.w(),
		layout: {top: 0, left: 300, right: 0, height: 48},

		general: WescontrolWeb.TabButton.design({
			displayTitle: "General",
			layout: {bottom: 0, left:0, width:100, height: 38},
			action: "function(){console.log('action');SC.RunLoop.begin(); WescontrolWeb.configurationController.set('currentTab', 'general'); SC.RunLoop.end();}",
			isSelectedBinding: SC.Binding.oneWay("WescontrolWeb.configurationController.currentTab").isEqualTo("general")
			
		}),
		devices: WescontrolWeb.TabButton.design({
			displayTitle: 'Devices',
			layout: {bottom: 0, left:100, width:100, height: 38},
			action: "function(){console.log('action');SC.RunLoop.begin(); WescontrolWeb.configurationController.set('currentTab', 'devices'); SC.RunLoop.end();}",
			isSelectedBinding: SC.Binding.oneWay("WescontrolWeb.configurationController.currentTab").isEqualTo("devices")
			
		}),
		sources: WescontrolWeb.TabButton.design({
			displayTitle: 'Sources',
			layout: {bottom: 0, left:200, width:100, height: 38},
			action: "function(){SC.RunLoop.begin(); WescontrolWeb.configurationController.set('currentTab', 'sources'); SC.RunLoop.end();}",
			isSelectedBinding: SC.Binding.oneWay("WescontrolWeb.configurationController.currentTab").isEqualTo("sources")
			
		}),
		actions: WescontrolWeb.TabButton.design({
			displayTitle: 'Actions',
			layout: {bottom: 0, left:300, width:100, height: 38},
			action: "function(){SC.RunLoop.begin(); WescontrolWeb.configurationController.set('currentTab', 'actions'); SC.RunLoop.end();}",
			isSelectedBinding: SC.Binding.oneWay("WescontrolWeb.configurationController.currentTab").isEqualTo("actions")
			
		}),
		preview: WescontrolWeb.TabButton.design({
			displayTitle: 'Preview',
			layout: {bottom: 0, left:400, width:100, height: 38},
			action: "function(){SC.RunLoop.begin(); WescontrolWeb.configurationController.set('currentTab', 'preview'); SC.RunLoop.end();}",
			isSelectedBinding: SC.Binding.oneWay("WescontrolWeb.configurationController.currentTab").isEqualTo("preview")
			
		}),
		confirm: WescontrolWeb.TabButton.design({
			displayTitle: 'Confirm',
			layout: {bottom: 0, left: 500, width:100, height:38},
			isVisibleBinding: "WescontrolWeb.configurationController.configDirty",
			action: "function(){SC.RunLoop.begin(); WescontrolWeb.configurationController.set('currentTab', 'confirm'); SC.RunLoop.end();}",
			isSelectedBinding: SC.Binding.oneWay("WescontrolWeb.configurationController.currentTab").isEqualTo("confirm")
		})
	}).classNames('tab-bar'),
	
	mainView: SC.ContainerView.design(SC.Animatable, {
		layout: {left: 300, top: 48, bottom:0, right: 0},
		transitions: {
			bottom: { duration: 0.25 } // with custom timing curve
		},
		//scenes: 'general devices sources actions preview'.w(),
		contentViewBinding: "WescontrolWeb.configurationController.currentView"
	}),
	
	confirmReminder: SC.View.design(SC.Animatable, {
		height: 50,
		showing: NO,
		layout: {left:300, right:0, bottom:0, height: 0},
		backgroundColor: "orange",
		transitions: {
			height: { duration: 0.25 } // with custom timing curve
		},
		
		childViews: ['confirmLabel'],
		confirmLabel: SC.LabelView.design({
			layout: {centerX: 0, centerY: 0, height: 30, width: 570},
			value: "Click confirm to save your changes to the device"
		}),
		
		recordsDirtied: function(){
			if(WescontrolWeb.configurationController.get('configDirty')) {
				this.parentView.mainView.adjust("bottom", this.height);
				this.adjust("height", this.height);
				this.showing = YES;
			}
			else {
				this.parentView.mainView.adjust("bottom", 0);
				this.adjust("height", 0);
				this.showing = NO;
			}
		}.observes("WescontrolWeb.configurationController.configDirty")
	})
});
