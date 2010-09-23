// ==========================================================================
// Project:   WescontrolWeb.GeneralConfigurationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals WescontrolWeb */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
WescontrolWeb.GeneralConfigurationView = SC.View.extend(
/** @scope WescontrolWeb.GeneralConfigurationView.prototype */ {
	
	classNames: "general-configuration",
	
	childViews: "generalSettings graphImage".w(),
	
	generalSettings: SC.View.design({
		layout: {left: 0, right: 0, height: 100},
		
		childViews: "nameField buildingField".w(),
		
		nameField: SC.View.design({
			layout: {left: 20, width:250, height:38, top: 30},
			childViews: "nameLabel nameField".w(),
			
			nameLabel: SC.LabelView.design({
				layout: {left:0, width: 80, height:38, centerY: 0},
				value: "Name:"
			}),
			
			nameField: SC.TextFieldView.design({
				layout: {left: 100, right:0, height: 30, centerY:0},
				valueBinding: "WescontrolWeb.roomListController.name"
			})
		}),
		
		buildingField: SC.View.design({
			layout: {right: 20, width:300, height:38, top: 30},
			childViews: "buildingLabel buildingField".w(),
			
			buildingLabel: SC.LabelView.design({
				layout: {left:0, width: 100, height:38, centerY: 0},
				value: "Building:"
			}),
			
			buildingField: SC.SelectButtonView.design({
				layout: {left: 120, right:0, height: 28, centerY:0},
				objectsBinding: "WescontrolWeb.buildingController.arrangedBuildings",
				nameKey: "name",
				valueKey: "guid",
				disableSort: true,
				emptyName: false,
				valueBinding: "WescontrolWeb.roomListController.building.guid",
				theme: 'square'
			})
		})
	}),
	
	graphImage: SC.View.design({
		layout: {top: 80, left: 20, right: 20, bottom: 20},
		childViews: ["image"],
		
		image: SC.ImageView.design({
			valueBinding: "WescontrolWeb.configurationController.graphValue"
		})
	}).classNames("graph-image")

  // TODO: Add your own code here.

});
