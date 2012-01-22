$(function() {
  var debug = 0,
      playlists,
      videoTitleTemplate = _.template('<h2 id="videoTitle"><%= title %></h1>'),

  Videos = Backbone.Collection.extend({
    initialize: function() {
      _.bindAll(this, 'selectRandomVideo');
      _.extend(this, Backbone.Events);
    },

    randomVideo: function() {
      // selects a random video and fires an event
      var rand;

      if (this.length <= 0) {
        alert('Error! No videos...');
        return;
      }

      // Choose random playlist
      rand = Math.floor(Math.random() * this.length);
      this.trigger('randomVideo', this.at(rand));
    },
  }),

  Playlists = Backbone.Collection.extend({
    init: function() {
      _.extend(this, Backbone.Events);
      _.bindAll(this, 'selectRandomPlaylist', 'selectRandomVideo');
      this.playlistVideos = {}; // cached object of videos by playlist

      return this;
    },

    retrieveJsonPlaylists: function() {
    },

    selectRandomPlaylist: function() {
      var rand;

      if (this.length <= 0) {
        alert('Error! No playlists...');
        console.log('Check to make sure debug==0');
        return null;
      }

      // Choose random playlist
      rand = Math.floor(Math.random() * this.length);
      return this.at(rand);
    },

    selectRandomVideoHelper: function(videos) {
      var rand;
      videos = this.selectedPlaylist.length;
      playlistVideos[_this.selectedPlaylist.title] = data;
      callback(_this.chooseVideo());
    },

    selectRandomVideo: function() {
      var videos, _this = this;

      this.selectedPlaylist = this.selectRandomPlaylist();
      this.trigger('randomPlaylist', this.selectedPlaylist);

      videos = this.selectedPlaylist.get('videos');

      if (!videos || !videos.length) {
        $.getJSON(this.selectedPlaylist.api_url, function(data) {
          videos = new Videos(data);
          _this.selectedPlaylist.set({ 'videos': videos });
          videos.bind('randomVideo', this.randomVideo);
          videos.randomVideo();
        });
      }
      else {
        this.selectRandomVideoHelper(videos);
      }
    },

    triggerRandomVideo: function(video) {
      // my stupid way of bubbling the event up
      this.trigger('randomVideo', video);
    }
  }),

  VideoPlayer = Backbone.View.extend({
    el: $('#videoPlayerContainer'),

    initialize: function() {
      this.videoPlayerTemplate = _.template('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/<%= youtube_id %>?autoplay=1" frameborder="0"></iframe>');

      return this;
    },

    render: function(video) {
      this.el.html(this.videoPlayerTemplate(video));
    }
  }),

  RouletteWheel = Backbone.View.extend({
    el: $('#chooser'),

    initialize: function() {
      _.bindAll(this, 'render',
                      'handleRandomPlaylist',
                      'handleRandomVideo');

      this.playlistEl = $('#playlist');
      this.playlistItemTemplate = _.template('<li id="playlist-<%= youtube_id %>" class="playlistItem"><%= title %></li>');

      this.render();
    },

    render: function() {
      var wheelEl = this.playlistEl.children('.wheel'),
          wheelHtml = '',
          _this = this,
          i, len;

      this.collection.each(function(playlistObj) {
        wheelHtml += _this.playlistItemTemplate(playlistObj.toJSON());
      });
      wheelEl.html(wheelHtml);
    },

    handleRandomPlaylist: function(playlist) {
      console.log(playlist);
    },

    handleRandomVideo: function(video) {
    }
  }),

  VideoChooser = function() {
    var chooser = {
      init: function() {
        _.bindAll(this, 'populatePlaylists',
                        'chooseVideo',
                        'getRandomVideoFromPlaylist',
                        'setupEventBindings',
                        'playRandomVideo');

        this.player = new VideoPlayer();

        $.getJSON('http://www.khanacademy.org/api/playlists', this.populatePlaylists);

        $('#rouletteBtn').click(this.playRandomVideo);

        return this;
      },

      populatePlaylists: function(data) {
        this.playlists = new Playlists(data);
        this.wheel     = new RouletteWheel({ collection: this.playlists });
        this.setupEventBindings();
      },

      chooseVideo: function() {
        var videoList = this.collection.playlistVideos[this.currPlaylist.title],
            rand = Math.floor(Math.random() * videoList.length);

        return videoList[rand];

        // Set video title
      },

      getRandomVideoFromPlaylist: function(callback) {
        var _this = this,
            playlistVideos = this.collection.playlistVideos;

        if (playlistVideos[this.currPlaylist.title]) {
          // We've already loaded the list of videos, use cached list.
          callback(this.chooseVideo());
        }
        else {
          $.getJSON(this.currPlaylist.api_url, function(data) {
            playlistVideos[_this.currPlaylist.title] = data;
            callback(_this.chooseVideo());
          });
        }
      },

      setupEventBindings: function() {
        this.playlists.bind('randomPlaylist', this.wheel.handleRandomPlaylist);
        this.playlists.bind('randomVideo', this.wheel.handleRandomVideo);
        this.playlists.bind('randomVideo', this.player.handleRandomVideo);
      },

      playRandomVideo: function(evt) {
        // click handler for roulette button
        var _this = this;

        evt.preventDefault();

        this.video = this.playlists.selectRandomVideo();
      }
    };

    return chooser.init();
  },

  init = function() {
    var chooser = new VideoChooser();
  };

  init();
});
