var VideoChooser = function() {
  this.initialize();
};

VideoChooser.prototype = {
  selection: {}, // shows how far down the hierarchy the user has selected

  initialize: function() {
    var playlistApiUrl;
    _.bindAll(this);

    this.player = new VideoPlayerView();
    this.dials = new VideoDialsView();

    if (!debug) {
      playlistApiUrl = 'http://www.khanacademy.org/api/v1/playlists';
    }
    else {
      var location = window.location.href;
      playlistApiUrl = location.substring(0, location.lastIndexOf('/')+1) + 'playlists.json';
    }

    $.getJSON(playlistApiUrl, this.populatePlaylists);

    $('#rouletteBtn').click(this.playRandomVideo);

    return this;
  },

  populatePlaylists: function(data) {
    var trimmedData   = [],
        categoryHash  = {},
        categories    = [],
        subcategories = [],
        name;

    // Extract out only fields we need
    _.each(data, function(playlist) {
      var trimmedPlaylist = {},
          extendedSlug    = playlist.extended_slug,
          slugSplit       = extendedSlug ? extendedSlug.split('/') : '',
          i,
          len,
          cat,
          subcat;

      // Infer category/subcategory from extended_slug.
      if (slugSplit) {
        trimmedPlaylist.categoryId = slugSplit[0];
        trimmedPlaylist.subcategoryId = (slugSplit.length > 1) ? slugSplit[1] : trimmedPlaylist.categoryId;
      }

      if (_.isEmpty(categoryHash[trimmedPlaylist.categoryId])) {
        categoryHash[trimmedPlaylist.categoryId] = {};
      }
      if (_.isEmpty(categoryHash[trimmedPlaylist.categoryId][trimmedPlaylist.subcategoryId])) {
        categoryHash[trimmedPlaylist.categoryId][trimmedPlaylist.subcategoryId] = 1;
      }

      trimmedPlaylist.id = playlist.id.replace(/['"]/g, '');
      trimmedPlaylist.url_id = playlist.id;
      trimmedPlaylist.title = playlist.title;

      trimmedData.push(trimmedPlaylist);
    });

    // Store categories and subcategories
    for (cat in categoryHash) {
      // Store category
      name = cat.split('-');
      name[0] = name[0][0].toUpperCase() + name[0].substring(1); // uppercase first letter in name
      categories.push({
        id: cat,
        title: name.join(' ')
      });

      // Store subcategory
      for (subcat in categoryHash[cat]) {
        name = subcat.split('-');
        name[0] = name[0][0].toUpperCase() + name[0].substring(1); // uppercase first letter in name
        // Correct for 'core-finance' subcategory existing in both 'finance-economics' and 'science' categories.
        if (subcat !== 'core-finance' || cat === 'finance-economics') {
          subcategories.push({
            id: subcat,
            title: name.join(' '),
            categoryId: cat
          });
        }
      }
    }
    this.categories = new Backbone.Collection(categories);
    this.subcategories = new Backbone.Collection(subcategories);

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
    eventsMediator.bind('controls:playVideo', this.playVideo);

    eventsMediator.bind('controls:loadCategory', this.loadCategory);
    eventsMediator.bind('chooser:loadCategory', this.controls.subcategoriesView.loadCategory);
    eventsMediator.bind('chooser:loadCategory', this.controls.playlistsView.reload);
    eventsMediator.bind('chooser:loadCategory', this.controls.videosView.reload);

    eventsMediator.bind('controls:loadSubcategory', this.loadSubcategory);
    eventsMediator.bind('chooser:loadSubcategory', this.controls.playlistsView.loadSubcategory);
    eventsMediator.bind('chooser:loadSubcategory', this.controls.videosView.reload);

    eventsMediator.bind('controls:loadPlaylist', this.loadPlaylist);
    eventsMediator.bind('chooser:loadPlaylist', this.controls.videosView.loadPlaylist);

    this.playlists.bind('playlists:randomPlaylist', this.controls.handleRandomPlaylist);
    this.playlists.bind('playlists:randomVideo', this.controls.handleRandomVideo);
    this.playlists.bind('playlists:randomVideo', this.player.playVideo);
    this.playlists.bind('playlists:newVideoList', this.controls.resetVideoList);
    this.dials.bind('dials:randomPlaylist', this.playlists.selectRandomPlaylist);
    this.dials.bind('dials:randomVideo', this.playlists.selectRandomVideo);
  },

  loadCategory: function(cat) {
    var categoryChanged = this.selection.categoryId !== cat,
        subcat = (categoryChanged ? undefined : this.selection.subcategoryId),
        playlist = (categoryChanged ? undefined : this.selection.playlistId);

    this.selection.categoryId    = cat;
    this.selection.subcategoryId = subcat;
    this.selection.playlistId    = playlist;
    eventsMediator.trigger('chooser:loadCategory', this.selection);
  },

  loadSubcategory: function(subcat) {
    var subcategoryChanged = this.selection.subcategoryId !== cat,
        playlist = (subcategoryChanged ? undefined : this.selection.playlistId);

    this.selection.subcategoryId = subcat;
    this.selection.playlistId    = playlist;
    eventsMediator.trigger('chooser:loadSubcategory', this.selection);
  },

  loadPlaylist: function(playlist) {
    var playlistChanged = this.selection.playlistId !== playlist,
        _this = this;

    videos = this.videos.where({ playlistId: playlist });
    this.selection.playlistId = playlist;

    if (!_.isEmpty(videos)) {
      // Video list was already downloaded
      eventsMediator.trigger('chooser:loadPlaylist', this.selection);
    }
    else {
      // Need to fetch video list
      this.fetchVideosForPlaylist(playlist, function(v) {
        eventsMediator.trigger('chooser:loadPlaylist', _this.selection);
      });
    }
  },

  fetchVideosForPlaylist: function(playlistToFetch, callback) {
    var playlist, videos, _this = this;

    if (typeof playlistToFetch === 'string') {
      playlist = this.playlists.get(playlistToFetch);
    }
    else {
      // playlist was passed in directly
      playlist = playlistToFetch;
    }

    $.getJSON('http://www.khanacademy.org/api/v1/playlists/' + playlist.get('url_id') + '/videos', function(data) {
      var trimmedVideos = [];
      _.each(data, function(video) {
        trimmedVideos.push({
          readable_id:   video.readable_id,
          youtube_id:    video.youtube_id,
          title:         video.title,
          description:   video.description,
          views:         video.views,
          ka_url:        video.ka_url,
          categoryId:    _this.selection.categoryId,
          subcategoryId: _this.selection.subcategoryId,
          playlistId:    playlist.id
        });
      });

      _this.videos.add(trimmedVideos);

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
