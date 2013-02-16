var CategoriesView = ListView.extend({
  template: _.template('<li id="category-<%= id %>" class="category-item"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    var $target = $(evt.target),
        $parent = $target.parent(),
        id;

    evt.preventDefault();
    if ($target[0].nodeName === 'A') {
      id = $parent.attr('id').substring(9);
      eventsMediator.trigger('controls:loadCategory', id);
    }
  }
});
