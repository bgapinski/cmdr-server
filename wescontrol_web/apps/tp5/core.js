// ==========================================================================
// Project:		Tp5
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Tp5 p */

/** @namespace

	My cool new app.	Describe your application.
	
	@extends SC.Object
*/
Tp5 = SC.Application.create(
	/** @scope Tp5.prototype */ {

	NAMESPACE: 'Tp5',
	VERSION: '0.2.0',

	// This is your application store.	You will use this store to access all
	// of your model data.	You can also set a data source on this store to
	// connect to a backend server.	 The default setup below connects the store
	// to any fixtures you define.
	//store: SC.Store.create().from(SC.Record.fixtures)
	store: SC.Store.create().from('Tp5.CouchDataSource'),
	
	// TODO: Add global constants or singleton objects needed by your app here.
	
	debugging: NO,
	
	log: function(){
		if(this.debugging)console.log.apply(console, arguments);
	}

}) ;

p = function(path){
	return SC.objectForPropertyPath(path);
};
