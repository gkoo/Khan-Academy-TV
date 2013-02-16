var SubcategoriesView = ListView.extend({
  template: _.template('<li id="subcategory-<%= id %>" class="dropdown-item for-<%= categoryId %>"><a href="#"><%= title %></a></li>'),

  loadCategory: function(selectionObj) {
    this.selectionObj.categoryId = selectionObj.categoryId;
    this.selectionId = selectionObj.categoryId;
    this.render();
  },

  handleClick: function(evt) {
    var $target = $(evt.target),
        $parent = $target.parent(),
        id;

    evt.preventDefault();
    if ($target[0].nodeName === 'A') {
      id = $parent.attr('id').substring(12);
      eventsMediator.trigger('controls:loadSubcategory', id);
    }
  },

  selectionObj: {
    categoryId: ''
  },

  selectionId: '' // used for the "for-" class
});
