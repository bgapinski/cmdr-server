slinky_require('../core.coffee')
slinky_require('configure_list.coffee')
slinky_require('bind_view.coffee')

App.DevicesConfigureView = App.BindView.extend
  initialize: () ->
    App.rooms.bind "change:selection", @render, this
    @configure_list = new App.ConfigureListView(App.devices)
    App.devices.bind "change:selection", @change_selection, this
    @change_selection()

  set_up_bindings: (room) ->
    @unbind_all()
    if @device
      @field_bind "input[name='name']", @device,
        ((r) -> r.get('params')?.name),
        ((r, v) -> r.set(params: _(r.get('params')).extend(name: v)))
      @field_bind "select[name='type']", @device,
        ((r) -> r.driver().type()),
        ((r, v) => @update_drivers(v))
      @field_bind "select[name='driver']", @device,
        ((r) -> r.driver().get('name')),
        ((r, v) => r.set(driver: v); @update_options(v))

  change_selection: () ->
    @device = App.devices.selected
    @update_drivers(@device?.driver().type())
    @update_options(@device?.driver().get('name'))
    @set_up_bindings()

  update_drivers: (type) ->
    options = _(App.drivers.get_by_type(type))
      .chain()
      .filter((d) -> not d.get('abstract'))
      .invoke("get", "name")
      .map((d) -> "<option value=\"#{d}\">#{d}</option>")
      .value()
      .join("\n")
    $("select[name='driver']", @el).html options

  update_options: (name) ->
    driver = App.drivers.get_by_name(name)
    if driver
      hash =
        options: _(driver.options()).map((d) =>
          _.extend(_.clone(d), ports: @model.get('params').ports))
      console.log(hash)
      $(".options", @el).html(App.templates.driver_options(hash))


  render: () ->
    @model = App.rooms.selected
    if @model
      types = _(App.drivers.pluck("type")).chain().compact().uniq().value()
      hash =
        types: types
      $(@el).html App.templates.device_configure(hash)
      $(".device-list", @el).html @configure_list.render().el
      #@set_up_bindings(@model)

    this
