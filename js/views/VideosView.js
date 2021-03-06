var VideosView = ListView.extend({
  template: _.template('<li id="video-<%= id %>" data-youtube-id="<%= youtube_id %>" class="dropdown-item for-playlist-<%= playlistId %>"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    // time to play a video!
    var $target = $(evt.target),
        $parent = $target.parent(),
        videoId;
    if ($parent.hasClass('dropdown-item')) {
      videoId = $parent.attr('id').substring(6);
      eventsMediator.trigger('controls:playVideo', videoId);
    }

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

  setHighlight: function(videoId, doCenter) {
    var $item = $('#video-' + videoId).children('a');
    this.highlightHelper($item);

    if (doCenter) {
      this.centerItem($item);
    }
  },

  clear: function(id) {
    if (id !== this.selectionId) {
      this.$el.find('.dropdown-item').hide();
    }
  },

  onNoVideos: function() {
    this.$el.find('.dropdown-item').hide();
    this.$el.find('.error').show();
  },

  // Define the higher-level selections in this object.
  // Type: Object<String, String>
  selectionObj: {},

  // Define the current level selection id here.
  // Type: String
  selectionId: ''
});
