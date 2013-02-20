var VideosView = ListView.extend({
  template: _.template('<li id="video-<%= id %>" data-youtube-id="<%= youtube_id %>" class="dropdown-item for-playlist-<%= playlistId %>"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    // time to play a video!
    var $target = $(evt.target),
        $parent = $target.parent(),
        videoId = $parent.attr('id').substring(6);

    eventsMediator.trigger('controls:playVideo', videoId);

    evt.preventDefault();
  },

  // Check if any ancestors have changed. If so, hide dropdown.
  reload: function(selectionObj) {
    // Clear out the playlist view if we're changing categories
    if (selectionObj.categoryId !== this.selectionObj.categoryId ||
        selectionObj.subcategoryId !== this.selectionObj.subcategoryId) {
      this.selectionObj.categoryId = '';
      this.selectionObj.subcategoryId = '';
      this.selectionObj.playlistId = '';
      this.selectionId = '';
      this.render();
    }
  },

  loadPlaylist: function(selectionObj) {
    this.selectionObj.categoryId = selectionObj.categoryId;
    this.selectionObj.subcategoryId = selectionObj.subcategoryId;
    this.selectionObj.playlistId = selectionObj.playlistId;
    this.selectionId = selectionObj.playlistId;
    this.render();
  },

  setHighlight: function(videoId) {
    var item = $('#video-' + videoId).children('a');
    this.highlightHelper(item);
  },

  // Define the higher-level selections in this object.
  // Type: Object<String, String>
  selectionObj: {},

  // Define the current level selection id here.
  // Type: String
  selectionId: ''
});
