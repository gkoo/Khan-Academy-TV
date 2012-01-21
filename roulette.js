$(function() {
  var debug = 1,
      playlists,
      videoTitleTemplate = _.template('<h2 id="videoTitle"><%= title %></h1>'),

  VideoCollection = function() {
    this.init = function() {
      var _this = this;

      this.playlistVideos = {}; // cached object of videos by playlist

      if (!debug) {
        $.getJSON('http://www.khanacademy.org/api/playlists', function(data) {
          _this.playlists = data;
        });
      }
      return this;
    };

    this.getRandomPlaylist = function() {
      if (!this.playlists || !this.playlists.length) {
        alert('Error! No playlists...');
        console.log('Check to make sure debug==0');
        return null;
      }

      // Choose random playlist
      rand = Math.floor(Math.random() * this.playlists.length);
      return this.playlists[rand];
    };

    return this.init();
  },

  VideoPlayer = function() {
    this.el = $('#videoPlayerContainer');

    this.init = function() {
      this.videoPlayerTemplate = _.template('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/<%= youtube_id %>?autoplay=1" frameborder="0"></iframe>');

      return this;
    };

    this.play = function(video) {
      this.el.html(this.videoPlayerTemplate(video));
    };

    return this.init();
  },

  VideoChooser = function() {
    this.init = function() {
      var _this = this;
      $('#rouletteBtn').click(_this.playRandomVideo);
      this.collection = new VideoCollection();
      this.player = new VideoPlayer();

      this.playlistLabelEl = $('#playlistLabel');
      this.videoLabelEl = $('#videoLabel');

      return this;
    };

    this.chooseVideo = function() {
      var videoList = this.collection.playlistVideos[this.currPlaylist.title],
          rand = Math.floor(Math.random() * videoList.length);

      return videoList[rand];

      // Set video title
    };

    this.getRandomVideoFromPlaylist = (function(callback) {
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
    }).bind(this);

    this.playRandomVideo = (function(evt) {
      // click handler for roulette button
      var rand, playlistHeaderHtml,
          _this = this;

      evt.preventDefault();

      this.currPlaylist = this.collection.getRandomPlaylist();
      if (this.currPlaylist === null) {
        alert('Error: couldn\'t retrieve playlist.');
      }

      // Set playlist title
      this.playlistLabelEl.find('.value').text(this.currPlaylist.title);

      // Choose random video from playlist
      this.getRandomVideoFromPlaylist(function(video) {
        _this.currVideo = video;
        _this.videoLabelEl.find('.value').text(video.title);
        _this.player.play(video);
      });
    }).bind(this);

    return this.init();
  },

  init = function() {
    var chooser = new VideoChooser();
  };

  init();
});
