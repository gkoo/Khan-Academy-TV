var PlaylistsView = ListView.extend({
  template: _.template('<li id="playlist-<%= id %>" class="dropdown-item for-<%= subcategoryId %>"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    this.clickHelper(evt, 'controls:loadPlaylist');
  },

  reload: function(selectionObj) {
    // Clear out the playlist view if we're changing categories
    if (selectionObj.categoryId !== this.selectionObj.categoryId) {
      this.selectionObj.categoryId = '';
      this.selectionObj.subcategoryId = '';
      this.selectionId = '';
      this.render();
    }
  },

  loadSubcategory: function(selectionObj) {
    this.selectionObj.categoryId = selectionObj.categoryId;
    this.selectionObj.subcategoryId = selectionObj.subcategoryId;
    this.selectionId = selectionObj.subcategoryId;
    this.render();
  },

  setHighlight: function(id, doCenter) {
    var $item = $('#playlist-' + id).children('a');
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
