var SubcategoriesView = ListView.extend({
  template: _.template('<li id="subcategory-<%= id %>" class="dropdown-item for-<%= categoryId %>"><a href="#"><%= title %></a></li>'),

  loadCategory: function(selectionObj) {
    this.selectionObj.categoryId = selectionObj.categoryId;
    this.selectionObj.subcategoryId = selectionObj.subcategoryId;
    this.selectionId = selectionObj.categoryId;
    this.render();
  },

  handleClick: function(evt) {
    this.clickHelper(evt, 'controls:loadSubcategory');
  },

  setHighlight: function(selObj, doCenter) {
    var $item = $('#subcategory-' + selObj.subcategoryId).children('a');
    this.highlightHelper($item);

    if (doCenter) {
      this.centerItem($item);
    }
  },

  // Define the higher-level selections in this object.
  // Type: Object<String, String>
  selectionObj: {},

  // Define the current level selection id here.
  // Type: String
  selectionId: ''
});
