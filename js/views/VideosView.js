var VideosView = ListView.extend({
  template: _.template('<li value="video-<%= readable_id %>" data-youtube-id="<%= youtube_id %>" class="video for-playlist-<%= playlistId %>"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    // time to play a video!
    var $listItem = $(evt.target).parent();
    youtube_id = $listItem.attr('data-youtube-id');
    eventsMediator.trigger('controls:playVideo', youtube_id);
  },

  render: function() {
    var id = this.selectedPlaylistId,
        $dropdownEl = this.$el.find('.dropdown'),
        html = '',
        $videoItems,
        videoModels,
        i,
        len;

    if (id) {
      $videoItems = this.$el.find('.for-playlist-' + id);

      if ($videoItems.length === 0) {
        // Need to create DOM elements
        videoModels = this.collection.where({ playlistId: id });

        if (_.isEmpty(videoModels)) {
          throw "No videos found for playlist " + id;
        }

        for (i = 0, len = videoModels.length; i < len; ++i) {
          html += this.template(videoModels[i].toJSON());
        }
        this.$el.find('.video').hide();
        $dropdownEl.append($(html));
      }
      else {
        // DOM elements already created. Just need to show() them.
        this.$el.find('.video').not($videoItems).hide();
        $videoItems.show();
      }

      $dropdownEl.show();
    }
    else {
      $dropdownEl.hide();
    }
    return this;
  },

  showPlaylist: function(id) {
    this.selectedPlaylistId = id;
    this.render();
  }
});
