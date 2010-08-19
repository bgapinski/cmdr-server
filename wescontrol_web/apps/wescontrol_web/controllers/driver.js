// ==========================================================================
// Project:   WescontrolWeb.driverController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals WescontrolWeb */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
WescontrolWeb.driverController = SC.TreeController.create(
/** @scope WescontrolWeb.driverController.prototype */ {
	
	currentType: null,
	typeHash: {},

	refreshSources: function(){
		var type_hash = {};
		var type_array = []; //this is stupid, but it's JS's fault
		var drivers = WescontrolWeb.store.find(WescontrolWeb.Driver);
		drivers.forEach(function(driver, index){
			var type = driver.get('type');
			if(!type){
				type = drivers.find(function(parent){
					return parent.get('name') == driver.get('depends_on');
				});
				type = type ? type.get('type') : null;
			}
			if(type && !type_hash[type]){
				type_hash[type] = [];
				type_array.pushObject(type);
			}
			if(type && !driver.get('abstract')){
				type_hash[type].pushObject(driver);
			}
		});
		this.set('typeHash', type_hash);
		var types = SC.Object.create({
			treeItemIsExpanded: YES,
			hasContentIcon: NO,
			isType: YES,
			treeItemChildren: type_array.filter(function(type){
				return type_hash[type].get('length') > 0;
			}).map(function(type){
				return SC.Object.create({
					name: type,
					contentValueKey: 'name',
					treeItemChildren: type_hash[type].map(function(driver){
						return driver.mixin({
							isDriver: YES,
							contentValueKey: "name",
							realType: type
						});
					})
				});
			})
		});
		this.set('content', types);		
	},
	
	arrangedTypes: function(){
		if(this.get('arrangedObjects'))
		{
			return this.get('arrangedObjects').filterProperty("isType");
		}
		return [];
	}.property("arrangedObjects").cacheable(),
	
	arrangedDrivers: function(){
		if(this.get('content'))
		{
			return this.get('typeHash')[this.get('currentType')];
		}
		return [];
	}.property("currentType").cacheable()
	
}) ;
