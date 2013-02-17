var CategoriesView = ListView.extend({
  template: _.template('<li id="category-<%= id %>" class="dropdown-item"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    this.clickHelper(evt, 'controls:loadCategory');
  },

  // No selection hierarchy necessary for this view.
  selectionObj: undefined,

  selectionId: undefined
});
