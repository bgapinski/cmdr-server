// ==========================================================================
// Project:		this.appObject.CouchDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals CouchDataSource */

/** @class

	(Document Your Data Source Here)

	@extends SC.DataSource
*/

CouchDataSource = SC.DataSource.extend(
/** @scope this.appObject.CouchDataSource.prototype */ {
	
	//set this to your global application object to make everything work
	appObject: null,
	
	disableChanges: NO,
	
	init: function(){
		sc_super();
		parent = this;
				
		this.comet = SC.Object.create({
			appObject: parent.appObject,
			
			/**
			* Stop looking at the changes feed. Use this is you're doing something
			* which will overload the changes feed, causing problems (ex: volume
			* control)
			*/
			disableChangesBinding: "parent.disableChanges",

			disableChangesChanged: function(){
				if(!this.get('disableChanges') && this.running)
				{
					this.doRequest();
				}
			}.observes('disableChanges'),
						
			start: function(){
				if(this.running)return;
				this.running = YES;
				SC.Timer.schedule({
					target: this,
					action: "doRequest",
					interval: 50
				});
			},
			
			doRequest: function(){
				if(!this.get('disableChanges') && this.running)
				{
					SC.Request.getUrl('/rooms/_changes?filter=wescontrol_web/device&since=' + this.since).json()
						.notify(this, "requestFinished")
						.send();
				}
			},
			
			requestFinished: function(response){
				var body = response.get('body');
				if(body.results){
					var self = this;
					body.results.forEach(function(doc){
						SC.Request.getUrl('/rooms/' + doc['id']).json()
							.notify(self, "fetchedChangedRecord")
							.send();
					});
					this.since = body.last_seq;
				}

				if (this.timer) this.timer.invalidate();
				this.timer = SC.Timer.schedule({
					interval: 1000,
					target: this,
					action: "doRequest",
					repeating: NO
				});
			},
			
			fetchedChangedRecord: function(response){
				var body = response.get('body');
				if(body)
				{
					console.log("%s changed", body['_id']);
					var device = this.appObject.store.find(this.appObject.Device, body._id);
					console.log(device);
					//device.set('state_vars', body.attributes.state_vars);
					//device.set('name', device.get('name')+1);
					var record = {
						guid: body._id, 
						name: body.attributes.name,
						room: body.belongs_to,
						state_vars: body.attributes.state_vars,
						driver: body['class']
					};
					
					for(var config in body.attributes.config)
					{
						record[config] = body.attributes.config[config];
					}
					
					SC.RunLoop.begin();
					this.appObject.store.loadRecords(this.appObject.Device, [record]);
					SC.RunLoop.end();
				}
			},
			
			running: NO,
			
			since: 0
		});
		
		this.comet.start();
		
	},

	// ..........................................................
	// QUERY SUPPORT
	// 

	fetch: function(store, query) {

		// TODO: Add handlers to fetch data for specific queries.	 
		// call store.dataSourceDidFetchQuery(query) when done.
		if(query.recordType == this.appObject.Building) {
			SC.Request.getUrl('/rooms/_design/wescontrol_web/_view/building').json()
				.notify(this, 'didFetchBuildings', store, query)
				.send();
			return YES;
		}
		else if(query.recordType == this.appObject.Source){
			console.log("Fetching sources");
			SC.Request.getUrl('/rooms/_design/wescontrol_web/_view/sources').json()
				.notify(this, 'didFetchSources', store, query)
				.send();
			return YES;
		}
		else if(query.recordType == this.appObject.Action){
			SC.Request.getUrl('/rooms/_design/wescontrol_web/_view/actions').json()
				.notify(this, 'didFetchActions', store, query)
				.send();
			return YES;
		}
		else if(this.appObject.Driver && query.recordType == this.appObject.Driver){
			SC.Request.getUrl('/drivers/_design/drivers/_view/by_name').json()
				.notify(this, 'didFetchDrivers', store, query)
				.send();
			return YES;
		}
		/*else if(query.recordType == this.appObject.Device)
		{
			SC.Request.getUrl('/rooms/_design/wescontrol_web/_view/device').json()
				.notify(this, 'didFetchDevices', store, query)
				.send();
			return YES;
		}*/

		return NO ; // return YES if you handled the query
	},
	didFetchDevices: function(response, store, query){
		if(SC.ok(response)) {
			store.loadRecords(this.appObject.Device, response.get('body').rows.mapProperty('value'));
			store.dataSourceDidFetchQuery(query);
		}
		else {
			store.dataSourceDidErrorQuery(query, response);
		}
	},
	didFetchBuildings: function(response, store, query){
		if (SC.ok(response)) {
			var buildings = [];
			var rooms = [];
			var room_hash = {};
			var devices = [];
			var last_building = null;
			response.get('body').rows.forEach(function(row){
				if(row.key[1] === 0) //this is a building
				{
					last_building = row.value;
					last_building["rooms"] = [];
					buildings.push(last_building);
				}
				else if(row.key[1] === 1)
				{
					last_building.rooms.push(row.value.guid);
					rooms.push(row.value);
					room_hash[row.value.guid] = row.value;
				}
				else if(row.key[1] === 2)
				{
					if(room_hash[row.value.room])
					{
						room_hash[row.value.room].devices.push(row.value.guid);
						devices.push(row.value);
					}
				}
			});
			store.loadRecords(this.appObject.Building, buildings);
			store.loadRecords(this.appObject.Room, rooms);
			store.loadRecords(this.appObject.Device, devices);
			store.dataSourceDidFetchQuery(query);
			this.fetchedBuildingsCallback(response);
		}
		else {
			store.dataSourceDidErrorQuery(query, response);
		}
	},
	didFetchSources: function(response, store, query){
		if (SC.ok(response)) {
			console.log("SOURCEFETCH");
			console.log(response.get("body"));
			var sources = [];
			response.get('body').rows.forEach(function(row){
				var icon_name = "";
				for(var prop in row.value._attachments)icon_name = prop;
				var source = {
					guid: row.id,
					_rev: row.value._rev,
					name: row.value.name,
					input: row.value.input,
					icon: "/rooms/" + row.id + "/" + icon_name,
					_attachments: row.value._attachments,
					belongs_to: row.value.belongs_to
				};
				sources.push(source);
			});
			store.loadRecords(this.appObject.Source, sources);
			store.dataSourceDidFetchQuery(query);
			this.fetchedSourcesCallback(response);
		}
		else {
			store.dataSourceDidErrorQuery(query, response);
		}
	},
	
	didFetchActions: function(response, store, query){
		if (SC.ok(response)) {
			var actions = [];
			response.get('body').rows.forEach(function(row){
				var icon_name = "";
				for(var prop in row.value._attachments)icon_name = prop;
				var action = {
					guid: row.id,
					_rev: row.value._rev,
					name: row.value.name,
					settings: row.value.settings,
					icon: "/rooms/" + row.id + "/" + icon_name,
					_attachments: row.value._attachments,
					belongs_to: row.value.belongs_to
				};
				actions.push(action);
			});
			store.loadRecords(this.appObject.Action, actions);
			store.dataSourceDidFetchQuery(query);
			this.fetchedActionsCallback(response);
		}
		else {
			store.dataSourceDidErrorQuery(query, response);
		}
	},
	
	didFetchDrivers: function(response, store, query){
		if (SC.ok(response)) {
			var drivers = [];
			response.get('body').rows.forEach(function(row){
				row.value.guid = row.value._id;
				delete row.value._id;
				drivers.push(row.value);
			});
			store.loadRecords(this.appObject.Driver, drivers);
			store.dataSourceDidFetchQuery(query);
			this.fetchedDriversCallback(response);
		}
		else {
			store.dataSourceDidErrorQuery(query, response);
		}
	},
	
	
	//implement this to do stuff when the controller is refreshed
	fetchedBuildingsCallback: function(response){
		//this.appObject.buildingController.refreshSources();			
	},
	
	fetchedSourcesCallback: function(response){
		
	},
	
	fetchedActionsCallback: function(response){
		
	},
	
	fetchedDriversCallback: function(response){
		
	},

	// ..........................................................
	// RECORD SUPPORT
	// 
	
	retrieveRecord: function(store, storeKey) {
		
		// TODO: Add handlers to retrieve an individual record's contents
		// call store.dataSourceDidComplete(storeKey) when done.
		
		return NO ; // return YES if you handled the storeKey
	},
		
	updateRecord: function(store, storeKey) {
		// TODO: Add handlers to submit modified record to the data source
		// call store.dataSourceDidComplete(storeKey) when done.

		return NO ; // return YES if you handled the storeKey
	},
	
	destroyRecord: function(store, storeKey) {
		
		// TODO: Add handlers to destroy records on the data source.
		// call store.dataSourceDidDestroy(storeKey) when done
		
		return NO ; // return YES if you handled the storeKey
	},
	
	randomUUID: function() {
		var s = [], itoh = '0123456789ABCDEF';

		// Make array of random hex digits. The UUID only has 32 digits in it, but we
		// allocate an extra items to make room for the '-'s we'll be inserting.
		for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);

		// Conform to RFC-4122, section 4.4
		s[14] = 4;  // Set 4 high bits of time_high field to version
		s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

		// Convert to hex chars
		for (i = 0; i <36; i++) s[i] = itoh[s[i]];

		// Insert '-'s
		s[8] = s[13] = s[18] = s[23] = '-';

		return s.join('');
	}
	
}) ;
