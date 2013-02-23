var VideoInfoView = Backbone.View.extend({
  el: $('#video-info'),

  initialize: function() {
    var templateStr = '';
    templateStr += '<h2 class="label"><%= title %></h2>';
    templateStr += '<div class="content">';
    templateStr += '<p><%= description %></p>';
    templateStr += '<p><%= views %> views</p>';
    templateStr += '<p><a href="<%= ka_url %>">View this video on the Khan Academy website</a></p>';
    templateStr += '</div>';

    this.template = _.template(templateStr);
  },

  render: function(model) {
    this.$el.html(this.template(model));
  }
});
