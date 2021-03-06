slinky_require('core.coffee')

App.SelectionCollection = Backbone.Collection.extend
  select: (id) ->
    item = this.get(id)
    @selected = item
    @trigger("change:selection")
    if item then item.trigger("selected")

##### BUILDINGS

App.Building = Backbone.RelationalModel.extend
  relations: [
    type: Backbone.HasMany,
    key: 'rooms',
    relatedModel: 'App.Room',
    collectionType: 'App.RoomController'
    reverseRelation:
      key: 'building',
      includeInJSON: 'id'
    ]


App.BuildingController = Backbone.Collection.extend
  model: App.Building

App.buildings = new App.BuildingController

##### ROOMS

App.Room = Backbone.RelationalModel.extend
  relations: [
    {
      type: Backbone.HasMany,
      key: 'devices',
      relatedModel: 'App.Device',
      collectionType: 'App.DeviceController'
      reverseRelation:
        key: 'belongs_to',
        includeInJSON: 'id'
    },
    {
      type: Backbone.HasMany,
      key: 'sources',
      relatedModel: 'App.Source',
      collectionType: 'App.SourceController'
      reverseRelation:
        key: 'belongs_to',
        includeInJSON: 'id'
    },
    {
      type: Backbone.HasMany,
      key: 'actions',
      relatedModel: 'App.Action',
      collectionType: 'App.ActionController',
      reverseRelation:
        key: 'belongs_to',
        inscludeInJSON: 'id'
    }
    ]


App.RoomController = App.SelectionCollection.extend
  model: App.Room

  initialize: () ->
    @bind("change", @fix_selection, this)
    @bind("reset", @fix_selection, this)

  fix_selection: () ->
    unless @selected
      @select(@min((r) -> r.get('params').name)?.id)


App.rooms = new App.RoomController

##### DEVICES

App.Device = Backbone.RelationalModel.extend
  idAttribute: "_id",

  driver: () -> App.drivers.get_by_name(@get("driver"))

  state_vars: () -> @get("attributes")?.state_vars or {}

  vars_array: () ->
    state_vars = @state_vars()
    _(state_vars).chain().keys().map (k) ->
      _(state_vars[k]).chain().clone().extend(name: k).value()
    .value()

  display_vars: () ->
    _(@vars_array()).chain()
      .filter((h) -> h.display_order)
      .sortBy((h) -> h.display_order)
      .value()

  controllable_vars: () ->
    _(@vars_array()).chain()
      .filter((h) -> h.editable == undefined or h.editable)
      .sortBy((h) -> if h.display_order then h.display_order else Infinity)
      .map (h) ->
        hp = _(h).chain().clone().extend(_type: {}).value()
        hp._type[h.type] = true;
        hp
      .value()

  state_set: (v, state) ->
    App.server.state_set(this, v, state)

App.ChildSelectionCollection = App.SelectionCollection.extend
  parent_key: "",

  initialize: () ->
    App.rooms.bind "change:selection", @parent_changed, this
    App.rooms.bind "change", @parent_changed, this
    @parent_changed()

  parent_changed: () ->
    @content = App.rooms.selected?.get(@parent_key)
    @trigger("change:content")
    if not @content
      @select(null)
    else if !@content.include @selected
      @select(@content.first()?.id)


App.DeviceController = App.ChildSelectionCollection.extend
  model: App.Device
  parent_key: "devices"

App.devices = new App.DeviceController

# SOURCES
App.Source = Backbone.RelationalModel.extend
  idAttribute: "_id",

App.SourceController = App.ChildSelectionCollection.extend
  model: App.Source
  parent_key: "sources"

App.sources = new App.SourceController

# ACTIONS
App.Action = Backbone.RelationalModel.extend
  idAttribute: "_id"

App.ActionController = App.ChildSelectionCollection.extend
  model: App.Action
  parent_key: "actions"

App.actions = new App.ActionController


##### DRIVERS

App.Driver = Backbone.Model.extend
  type: () ->
    if @get("type")
      @get("type")
    else
      App.drivers.find((d) => d.get('name') == @get('depends_on')).type()
  options: () ->
    _(@get("config")).chain()
      .map((v, k) ->
        type = {}
        type[v.type] = true
        _(v).chain().clone().extend(name: k, _type: type).value()
      )
      .filter((v) -> v.type)
      .value()

App.DriverController = Backbone.Collection.extend
  model: App.Driver
  get_by_name: (name) ->
    @find((d) -> d.get('name') == name)
  get_by_type: (type) ->
    @filter((d) -> d.type() == type)

App.drivers = new App.DriverController
