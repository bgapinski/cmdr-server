slinky_require('control.coffee')
slinky_require('monitor.coffee')
slinky_require('configure.coffee')
slinky_require('search.coffee')

App.MainView = Backbone.View.extend
  control_view: new App.ControlView
  monitor_view: new App.MonitorView
  configure_view: new App.ConfigureView

  select_tab: (tab) ->
    $("#top-bar #tab-bar .tab-button").removeClass("selected")
    $("#top-bar .tab-button##{tab}-button").addClass("selected")
    $("#main-view .subview").hide()
    $("#main-view ##{tab}").show()

  search_view: () ->
    view = new App.SearchView
    view.start()
    view
  render: () ->
    $('#main-view #control').html @control_view.render().el
    $('#main-view #monitor').html @monitor_view.render().el
    $('#main-view #configure').html @configure_view.render().el

    this