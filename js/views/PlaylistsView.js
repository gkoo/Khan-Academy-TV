var PlaylistsView = ListView.extend({
  template: _.template('<li id="playlist-<%= id %>" class="dropdown-item"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    var $target = $(evt.target),
        $parent = $target.parent(),
        id;

    evt.preventDefault();
    if ($target[0].nodeName === 'A') {
      id = $parent.attr('id').substring(9);
      eventsMediator.trigger('controls:loadPlaylist', id);
    }
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

  selectionObj: {
    categoryId: '',
    subcategoryId: ''
  },

  selectionId: '' // used for the "for-" class
});
