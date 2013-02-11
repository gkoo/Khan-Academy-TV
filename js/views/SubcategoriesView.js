var SubcategoriesView = ListView.extend({
  template: _.template('<li id="subcategory-<%= id %>" class="dropdown-item for-<%= categoryId %>"><a href="#"><%= title %></a></li>'),

  loadCategory: function(categoryId) {
    this.selectionObj.categoryId = categoryId;
    this.selectionId = categoryId;
    this.render();
  },

  handleClick: function(evt) {
  },

  selectionObj: {
    categoryId: ''
  },

  selectionId: '' // used for the "for-" class
});
