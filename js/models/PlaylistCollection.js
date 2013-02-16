var PlaylistCollection = Backbone.Collection.extend({
  initialize: function() {
    _.extend(this, Backbone.Events);
    _.bindAll(this, 'getRandomPlaylist',
                    'selectRandomPlaylist',
                    'selectRandomVideo',
                    'loadPlaylist',
                    'fetchVideosForPlaylist');

    return this;
  },

  getRandomPlaylist: function() {
    var rand;

    if (this.length <= 0) {
      alert('Error! No playlists...');
      return null;
    }

    // Choose random playlist
    rand = Math.floor(Math.random() * this.length);
    return this.at(rand);
  },

  selectRandomPlaylist: function(highlight) {
    highlight = typeof highlight !== 'undefined' ? highlight : false; // set default false
    this.selectedPlaylist = this.getRandomPlaylist();
    this.trigger('playlists:randomPlaylist', { playlist: this.selectedPlaylist,
                                               highlight: highlight });
  },

  selectRandomVideo: function() {
    var videos, _this = this;

    this.selectRandomPlaylist(true);
    videos = this.selectedPlaylist.get('videos');

    if (!videos || !videos.length) {
      // Haven't downloaded the playlist yet. Let's do so now.
      this.fetchVideosForPlaylist(this.selectedPlaylist, function(videos) {
        _this.trigger('playlists:newVideoList', videos);
        videos.chooseRandomVideo();
      });
    }
    else {
      // Playlist is already downloaded.
      this.trigger('playlists:newVideoList', videos);
      videos.chooseRandomVideo();
    }

  },

  loadPlaylist: function(id) {
    var _this = this,
        videos;

    this.selectedPlaylist = this.getPlaylistById(id);
    videos = this.selectedPlaylist.get('videos');

    if (videos && videos.length) {
      // Video list was already downloaded
      eventsMediator.trigger('playlists:newVideoList', videos);
    }
    else {
      // Need to fetch video list
      this.fetchVideosForPlaylist(id, function(v) {
        eventsMediator.trigger('playlists:newVideoList', v);
      });
    }
  },

  fetchVideosForPlaylist: function(playlistToFetch, callback) {
    var playlist, videos, _this = this;

    if (typeof playlistToFetch === 'string') {
      playlist = this.getPlaylistById(playlistToFetch);
    }
    else {
      // playlist was passed in directly
      playlist = playlistToFetch;
    }

    $.getJSON('http://www.khanacademy.org/api/v1/playlists/' + playlist.id + '/videos', function(data) {
      videos = new Videos(data);
      videos.playlistId = playlist.id;
      playlist.set({ 'videos': videos });
      videos.bind('videos:randomVideo', function(video) {
        _this.trigger('playlists:randomVideo', video);
      });

      if (callback) {
        callback(videos);
      }
    });
  }
});
