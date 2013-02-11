var CategoriesView = ListView.extend({
  template: _.template('<li id="category-<%= id %>" class="category-item"><a href="#"><%= title %></a></li>'),

  // This render should only be called once on application load.
  render: function() {
    var html  = '',
        _this = this;
    _.each(this.collection, function(cat) {
      html += _this.template(cat);
    });
    this.$el.children('.dropdown').html(html);
  },

  handleClick: function(evt) {
    var $listItem = $(evt.target).parent();
    eventsMediator.trigger('controls:loadCategory', $listItem.attr('id').substring(9));
  }
});
