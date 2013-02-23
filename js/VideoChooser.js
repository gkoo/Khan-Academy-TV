var VideoChooser = function() {
  this.initialize();
};

VideoChooser.prototype = {
  selection: {}, // shows how far down the hierarchy the user has selected

  initialize: function() {
    var playlistApiUrl,
        location;
    _.bindAll(this);

    this.player = new VideoPlayerView();
    this.dials = new VideoDialsView();

    if (!debug) {
      playlistApiUrl = 'http://www.khanacademy.org/api/v1/playlists';
    }
    else {
      location = window.location.href;
      playlistApiUrl = location.substring(0, location.lastIndexOf('/')+1) + 'playlists.json';
    }

    $.getJSON(playlistApiUrl, this.populatePlaylists);

    // make it easy to get a random item from an array
    Array.prototype.getRandomItem = function() {
      return this[Math.floor(Math.random()*this.length)];
    };

    return this;
  },

  populatePlaylists: function(data) {
    var trimmedData   = [],
        categoryHash  = {},
        categories    = [],
        subcategories = [];

    // Extract out only fields we need
    _.each(data, function(playlist) {
      var trimmedPlaylist = {},
          extendedSlug    = playlist.extended_slug,
          slugSplit       = extendedSlug ? extendedSlug.split('/') : '',
          i,
          len,
          cat,
          subcat;

      if (extendedSlug === 'random algorithms, probability') {
        // This the topic API for this topic is broken. Just skip this one.
        return;
      }

      // Infer category/subcategory from extended_slug.
      if (slugSplit) {
        // Sanitize category/subcategory IDs
        cat = slugSplit[0].replace(/\s/g, '-').replace(',','');
        subcat = (slugSplit.length > 1) ? slugSplit[1] : cat;
        subcat = subcat.replace(/\s/g, '-').replace(',','');

        trimmedPlaylist.categoryId = cat;
        trimmedPlaylist.subcategoryId = subcat;
      }

      if (trimmedPlaylist.subcategoryId === 'core-finance') {
        trimmedPlaylist.categoryId = 'finance-economics';
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
      categories.push({
        id: cat,
        title: (cat[0].toUpperCase() + cat.substring(1)).replace('-', ' ', 'g')
      });

      // Store subcategory
      for (subcat in categoryHash[cat]) {
        subcategories.push({
          id: subcat,
          title: (subcat[0].toUpperCase() + subcat.substring(1)).replace('-', ' ', 'g'),
          categoryId: cat
        });
      }
    }
    this.categories = new Backbone.Collection(categories);
    this.subcategories = new Backbone.Collection(subcategories);

    this.playlists = new PlaylistCollection(trimmedData);
    this.videos    = new VideoCollection();
    this.controls  = new ControlsView();
    this.videoInfo = new VideoInfoView();
    this.controls.setCollections({
      playlists: this.playlists,
      videos: this.videos,
      categories: this.categories,
      subcategories: this.subcategories
    });
    this.setupBindings();
  },

  setupBindings: function() {
    // CATEGORY
    eventsMediator.on('controls:loadCategory', this.loadCategory);
    eventsMediator.on('chooser:loadCategory', this.controls.categoriesView.setHighlight);
    eventsMediator.on('chooser:loadCategory', this.controls.subcategoriesView.loadCategory);
    eventsMediator.on('chooser:loadCategory', this.controls.playlistsView.reload);
    eventsMediator.on('chooser:loadCategory', this.controls.videosView.reload);

    // SUBCATEGORY
    eventsMediator.on('controls:loadSubcategory', this.loadSubcategory);
    eventsMediator.on('chooser:loadSubcategory', this.controls.subcategoriesView.setHighlight);
    eventsMediator.on('chooser:loadSubcategory', this.controls.playlistsView.loadSubcategory);
    eventsMediator.on('chooser:loadSubcategory', this.controls.videosView.reload);

    // PLAYLIST
    eventsMediator.on('controls:loadPlaylist', this.loadPlaylist);
    eventsMediator.on('controls:loadPlaylist', this.controls.videosView.clear);
    eventsMediator.on('controls:loadPlaylist', this.controls.playlistsView.setHighlight);
    // Need to handle this setHighlight call differently. Don't want to wait until AJAX call
    // is finished before highlighting, so the events are set up differently.
    eventsMediator.on('chooser:highlightPlaylist', this.controls.playlistsView.setHighlight);
    eventsMediator.on('chooser:loadPlaylist', this.controls.videosView.loadPlaylist);

    eventsMediator.on('dials:randomVideo', this.playRandomVideo);
    eventsMediator.on('controls:playVideo', this.playVideo);
    eventsMediator.on('controls:playVideo', this.controls.videosView.setHighlight);

    // VIDEO
    eventsMediator.on('chooser:noVideosFound', this.controls.videosView.onNoVideos);
  },

  loadCategory: function(cat, wasRandom) {
    var catId           = (typeof cat === 'string') ? cat : cat.id,
        categoryChanged = this.selection.categoryId !== catId,
        subcat          = (categoryChanged ? undefined : this.selection.subcategoryId),
        playlist        = (categoryChanged ? undefined : this.selection.playlistId);

    this.selection.categoryId    = catId;
    this.selection.subcategoryId = subcat;
    this.selection.playlistId    = playlist;
    eventsMediator.trigger('chooser:loadCategory', this.selection, wasRandom);
  },

  loadSubcategory: function(subcat, wasRandom) {
    var subcatId           = (typeof subcat === 'string') ? subcat : subcat.id,
        subcategoryChanged = this.selection.subcategoryId !== subcatId,
        playlist = (subcategoryChanged ? undefined : this.selection.playlistId);

    this.selection.subcategoryId = subcatId;
    this.selection.playlistId    = playlist;
    eventsMediator.trigger('chooser:loadSubcategory', this.selection, wasRandom);
  },

  loadPlaylist: function(playlist, wasRandom, callback) {
    var playlistModel = (typeof playlist === 'string') ? this.playlists.get(playlist) : playlist,
        playlistId = playlistModel.id,
        playlistChanged = this.selection.playlistId !== playlist,
        videos = this.videos.where({ playlistId: playlistId }),
        _this = this;

    this.selection.playlistId = playlistId;

    if (wasRandom) {
      // User didn't click directly on list UI item. Need to highlight it.
      eventsMediator.trigger('chooser:highlightPlaylist', playlistId, true);
    }
    if (!_.isEmpty(videos)) {
      // Video list was already downloaded
      eventsMediator.trigger('chooser:loadPlaylist', this.selection, wasRandom);
      if (callback) {
        callback();
      }
    }
    else if (!playlistModel.get('noVideos')) {
      // Need to fetch video list
      this.fetchVideosForPlaylist(playlist, function(videos) {
        if (videos) {
          eventsMediator.trigger('chooser:loadPlaylist', _this.selection, wasRandom);
          if (callback) {
            callback();
          }
        }
        // No videos found for this playlist!
        else {
          _this.onNoVideosFound(wasRandom);
        }
      });
    }
    else {
      // Already tried to get this playlist, but there were no videos returned.
      this.onNoVideosFound(wasRandom);
    }
  },

  onNoVideosFound: function(wasRandom) {
    if (wasRandom) {
      // just choose another random video.
      _this.playRandomVideo();
    }
    else {
      // user manually chose this playlist
      eventsMediator.trigger('chooser:noVideosFound');
    }
  },

  fetchVideosForPlaylist: function(playlistToFetch, callback) {
    var playlist, _this = this;

    if (typeof playlistToFetch === 'string') {
      playlist = this.playlists.get(playlistToFetch);
    }
    else {
      // playlist was passed in directly
      playlist = playlistToFetch;
    }

    $.getJSON('http://www.khanacademy.org/api/v1/topic/' + playlist.get('url_id') + '/videos', function(data) {
      var trimmedVideos;

      if (_.isEmpty(data)) {
        // No videos returned in response.
        playlist.set({ noVideos: true });
        if (callback) {
          callback();
        }
      }
      else {
        trimmedVideos = [];
        _.each(data, function(video) {
          trimmedVideos.push({
            id:            video.readable_id, // turn readable_id into regular id
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
          callback(trimmedVideos);
        }
      }
    });
  },

  playRandomVideo: function() {
    // click handler for roulette button
    var category,
        subcats,
        subcategory,
        playlists,
        playlist,
        _this = this;

    // RANDOM PLAYLIST
    playlist = this.playlists.at(Math.floor(Math.random() * this.playlists.length));
    this.loadCategory(playlist.get('categoryId'), true);
    this.loadSubcategory(playlist.get('subcategoryId'), true);

    this.loadPlaylist(playlist, true, function() {
      // RANDOM VIDEO
      var videos = _this.videos.where({ playlistId: playlist.id }),
          video  = videos.getRandomItem();

      eventsMediator.trigger('controls:playVideo', video.id, true);
    });
  },

  playVideo: function(id) {
    // get selectedPlaylist from this.playlist
    // search through videos for video
    var playlist,
        video = this.videos.get(id);

    // Display the video info
    if (video.length === 0) {
      throw "No video found for this Youtube id. Something is wrong!";
    }

    this.selection.videoId = id;

    // Start playing the video
    if (playVideo) {
      this.player.playVideo(video.get('youtube_id'));
    }
    this.videoInfo.render(video.toJSON());
  }
};
