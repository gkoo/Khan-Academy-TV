var ControlsView = Backbone.View.extend({
  el: $('#controls'),

  initialize: function() {
    _.bindAll(this);
    //_.extend(this, Backbone.Events);

    this.playlistsView = new PlaylistsView({ el: $('#playlists') });
    this.videosView = new VideosView({ el: $('#videos') });
    this.categoriesView = new CategoriesView({ el: $('#categories') });
    this.subcategoriesView = new SubcategoriesView({ el: $('#subcategories') });

    this.$playlistEl           = $('#playlists');
    this.$videoEl              = $('#videos');
    this.$videoInfoEl          = $('#videoInfo');
    this.constructVideoInfoTemplate();

    this.render();
  },

  render: function() {
    this.playlistsView.render();
    this.videosView.render();
  },

  setCollections: function(obj) {
    this.playlistsView.collection = obj.playlists;
    this.playlistsView.render();

    this.videosView.collection = obj.videos;

    this.categoriesView.collection = obj.categories;
    this.categoriesView.render();

    this.subcategoriesView.collection = obj.subcategories;

    return this;
  },

  constructVideoInfoTemplate: function() {
    var templateStr = '';
    templateStr += '<table class="infoTable">';
    templateStr += '  <tr valign="top"><th>Title</th><td><%= title %></td></tr>';
    //templateStr += '  <tr valign="top"><th>Playlists</th><td><%= playlist_titles.join(", ") %></td></tr>';
    templateStr += '  <tr valign="top"><th>Desc</th><td><%= description %></td></tr>';
    templateStr += '  <tr valign="top"><th>Views</th><td><%= views %></td></tr>';
    templateStr += '</table>';
    templateStr += '<p><a href="<%= ka_url %>">View this video on the Khan Academy website</a></p>';
    this.videoInfoTemplate = _.template(templateStr);
  },

  populateVideoInfo: function(video) {
    var infoHtml = this.videoInfoTemplate(video.toJSON());
    this.$videoInfoEl.find('.metadata').html(infoHtml);
    return this;
  },

  handleRandomPlaylist: function(o) {
    // Scroll playlist to top of the playlist wheel.
    this.handleRandomItem(o.playlist.id, 'playlist', o.highlight);
  },

  handleRandomVideo: function(video) {
    this.handleRandomItem(video.get('readable_id'), 'video', true);
    this.populateVideoInfo(video);
  },

  /*
  handleClick: function(evt) {
    var target = $(evt.target),
        youtube_id;

    evt.preventDefault();
    if (target.hasClass('playlistItem')) {
      youtube_id = target.attr('data-youtube-id');
      this.handleRandomItem(youtube_id, 'playlist', true);
      eventsMediator.trigger('controls:loadPlaylist', youtube_id);
    }
    else if (target.hasClass('videoItem')) {
      // time to play a video!
      youtube_id = target.attr('data-youtube-id');
      this.handleRandomItem(youtube_id, 'video', true);
      this.trigger('controls:selectedVideo', youtube_id);
    }
    else if (target.attr('id') === 'sliderBtn' || target.parent().attr('id') === 'sliderBtn') {
      if (this.el.hasClass('show')) {
        this.el.removeClass('show');
      }
      else {
        // is hidden; let's show.
        this.el.addClass('show');
      }
    }
  },
  */

  resetVideoList: function(videos) {
    var videoListEl = $('#videos-' + videos.playlistId),
        wheelHtml = '',
        _this = this,
        container = $('#video .wheelContainer'),
        newEl;

    if (!videoListEl.length) {
      // List element hasn't been constructed yet
      newEl = $('<ul>').attr('id', 'videos-'+videos.playlistId)
                       .addClass('video-list');

      videos.each(function(video) {
        wheelHtml += _this.videoItemTemplate(video.toJSON());
      });

      newEl.html(wheelHtml);
      container.append(newEl);
      newEl.addClass('selected')
           .siblings('.selected').removeClass('selected');

      this.makeDraggable(newEl, container);
    }
    else {
      // element already exists.
      if (!videoListEl.hasClass('selected')) {
        videoListEl.addClass('selected')
                   .siblings('ul').removeClass('selected');
      }
    }
  },

  makeDraggable: function(el, parent) {
    var parentTop = parent.offset().top,
        relativeTop = parent.height()/2 - 44, // sort of hacky, I just wanted to get to 81.
        minScroll = parentTop - el.height() + relativeTop,
        maxScroll = parentTop + relativeTop;

    el.draggable({ axis: 'y',
                   distance: 5 });
                   //containment: [0, minScroll, 0, maxScroll] }); // coordinates are relative to body, not container
  }
});
