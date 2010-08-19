// ==========================================================================
// Project:   WescontrolWeb
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals WescontrolWeb WC */

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
WescontrolWeb = SC.Application.create(
	/** @scope WescontrolWeb.prototype */ {

	NAMESPACE: 'WescontrolWeb',
	VERSION: '0.1.0',

	// This is your application store.  You will use this store to access all
	// of your model data.  You can also set a data source on this store to
	// connect to a backend server.  The default setup below connects the store
	// to any fixtures you define.
	
	//store: SC.Store.create().from(SC.Record.fixtures)
	store: null,
	
	onAuthenticationChanged: function(){
		if(WescontrolWeb.authController.authenticated && !this.store)
		{
			this.store = SC.Store.create().from('WescontrolWeb.CouchDataSource');
			WescontrolWeb.buildingController.refreshSources();
			WescontrolWeb.driverController.refreshSources();
		}
	}.observes("WescontrolWeb.authController.authenticated"),
	// TODO: Add global constants or singleton objects needed by your app here.
	
	debugging: true,
	
	log: function(){
		if(this.debugging)console.log.apply(console, arguments);
	}
	
}) ;

WC = WescontrolWeb;

SC.Binding.isEqualTo = function(thing){
	return this.transform(function(value, binding) {
		return value == thing ? YES : NO;
	}) ;
} ;

SC.Binding.ifTrue = function(a, b){
	return this.transform(function(value, binding) {
		return value ? a : b;
	}) ;
};