var CategoriesView = ListView.extend({
  template: _.template('<li id="category-<%= id %>" class="category-item"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    var $listItem = $(evt.target).parent();
    eventsMediator.trigger('controls:loadCategory', $listItem.attr('id').substring(9));
  }
});
