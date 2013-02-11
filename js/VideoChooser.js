var VideoChooser = function() {
  this.initialize();
};

VideoChooser.prototype = {
  selectedPlaylistId: '',

  categories: [],

  subcategories: [],

  initialize: function() {
    _.bindAll(this);

    this.player = new VideoPlayerView();
    this.dials = new VideoDialsView();

    if (!debug) {
      $.getJSON('http://www.khanacademy.org/api/v1/playlists', this.populatePlaylists);
    }

    $('#rouletteBtn').click(this.playRandomVideo);

    return this;
  },

  populatePlaylists: function(data) {
    var trimmedData = [],
        categories = {},
        subcategories = {};

    // Extract out only fields we need
    _.each(data, function(playlist) {
      var trimmedPlaylist = {},
          extendedSlug    = playlist.extended_slug,
          slugSplit       = extendedSlug ? extendedSlug.split('/') : '',
          categoryName,
          subcategoryName,
          i,
          len,
          cat,
          subcat;

      // Infer category/subcategory from extended_slug.
      if (slugSplit) {
        trimmedPlaylist.category = slugSplit[0];
        trimmedPlaylist.subcategory = (slugSplit.length > 1) ? slugSplit[1] : trimmedPlaylist.category;
      }

      // Do some formatting for human-readable name
      categoryName = trimmedPlaylist.category.split('-');
      categoryName[0] = categoryName[0][0].toUpperCase() + categoryName[0].substring(1);
      subcategoryName = trimmedPlaylist.subcategory.split('-');
      subcategoryName[0] = subcategoryName[0][0].toUpperCase() + subcategoryName[0].substring(1);

      if (_.isEmpty(categories[trimmedPlaylist.category])) {
        categories[trimmedPlaylist.category] = {
          id: trimmedPlaylist.category,
          title: categoryName.join(' ')
        };
      }
      if (_.isEmpty(subcategories[trimmedPlaylist.subcategory])) {
        subcategories[trimmedPlaylist.subcategory] = {
          id: trimmedPlaylist.subcategory,
          title: subcategoryName.join(' '),
          categoryId: trimmedPlaylist.category
        };
      }

      trimmedPlaylist.id = playlist.id.replace(/['"]/g, '');
      trimmedPlaylist.url_id = playlist.id;
      trimmedPlaylist.title = playlist.title;

      trimmedData.push(trimmedPlaylist);
    });

    for (cat in categories) {
      this.categories.push(categories[cat]);
    }
    for (subcat in subcategories) {
      this.subcategories.push(subcategories[subcat]);
    }

    this.playlists = new PlaylistCollection(trimmedData);
    this.videos    = new VideoCollection();
    this.controls  = new ControlsView();
    this.controls.setCollections({
      playlists: this.playlists,
      videos: this.videos,
      categories: this.categories,
      subcategories: this.subcategories
    });
    this.setupBindings();
  },

  setupBindings: function() {
    eventsMediator.bind('controls:loadPlaylist', this.loadPlaylist);
    eventsMediator.bind('controls:playVideo', this.playVideo);
    eventsMediator.bind('chooser:showPlaylist', this.controls.videosView.showPlaylist);
    eventsMediator.bind('controls:loadCategory', this.controls.subcategoriesView.loadCategory);
    this.playlists.bind('playlists:randomPlaylist', this.controls.handleRandomPlaylist);
    this.playlists.bind('playlists:randomVideo', this.controls.handleRandomVideo);
    this.playlists.bind('playlists:randomVideo', this.player.playVideo);
    this.playlists.bind('playlists:newVideoList', this.controls.resetVideoList);
    this.dials.bind('dials:randomPlaylist', this.playlists.selectRandomPlaylist);
    this.dials.bind('dials:randomVideo', this.playlists.selectRandomVideo);
  },

  loadPlaylist: function(id) {
    var videos;

    videos = this.videos.where({ playlistId: id });
    this.selectedPlaylistId = id;

    if (!_.isEmpty(videos)) {
      // Video list was already downloaded
      eventsMediator.trigger('chooser:showPlaylist', id);
    }
    else {
      // Need to fetch video list
      this.fetchVideosForPlaylist(id, function(v) {
        eventsMediator.trigger('chooser:showPlaylist', id);
      });
    }
  },

  fetchVideosForPlaylist: function(playlistToFetch, callback) {
    var playlist, videos, _this = this;

    if (typeof playlistToFetch === 'string') {
      playlist = this.playlists.getPlaylistById(playlistToFetch);
    }
    else {
      // playlist was passed in directly
      playlist = playlistToFetch;
    }

    $.getJSON('http://www.khanacademy.org/api/v1/playlists/' + playlist.get('url_id') + '/videos', function(data) {
      _.each(data, function(video) {
        video.playlistId = playlist.id;
      });

      _this.videos.add(data);

      if (callback) {
        callback(videos);
      }
    });
  },

  playRandomVideo: function(evt) {
    // click handler for roulette button
    var _this = this;
    evt.preventDefault();
    this.video = this.playlists.selectRandomVideo();
  },

  playVideo: function(youtube_id) {
    // get selectedPlaylist from this.playlist
    // search through videos for video
    var playlist,
        video;

    // Start playing the video
    this.player.playVideo(youtube_id);

    // Display the video info
    video = this.videos.where({ youtube_id: youtube_id });
    if (video.length === 0) {
      throw "No video found for this Youtube id. Something is wrong!"
    }
    this.controls.populateVideoInfo(video[0]);
  }
};