var debug = 0,
    playVideo = 1,

Videos = Backbone.Collection.extend({
  initialize: function() {
    _.bindAll(this, 'chooseRandomVideo');
    _.extend(this, Backbone.Events);
  },

  chooseRandomVideo: function() {
    // selects a random video and fires an event
    var rand;

    if (this.length <= 0) {
      alert('Error! No videos...');
      return;
    }

    // Choose random playlist
    rand = Math.floor(Math.random() * this.length);
    this.trigger('videos:randomVideo', this.at(rand));
    console.log('video: ' + this.at(rand).get('title'));
  },
}),

Playlists = Backbone.Collection.extend({
  init: function() {
    _.extend(this, Backbone.Events);
    _.bindAll(this, 'selectRandomPlaylist',
                    'selectRandomVideo');
    this.playlistVideos = {}; // cached object of videos by playlist

    return this;
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

  selectRandomVideo: function() {
    var videos, _this = this;

    this.selectedPlaylist = this.selectRandomPlaylist();
    this.trigger('randomPlaylist', this.selectedPlaylist);

    videos = this.selectedPlaylist.get('videos');

    if (!videos || !videos.length) {
      // Haven't downloaded the playlist yet. Let's do so now.
      $.getJSON(this.selectedPlaylist.get('api_url'), function(data) {
        videos = new Videos(data);
        videos.playlistId = _this.selectedPlaylist.get('youtube_id');
        _this.selectedPlaylist.set({ 'videos': videos });
        _this.trigger('playlists:newVideoList', videos);
        videos.bind('videos:randomVideo', function(video) {
          _this.trigger('playlists:randomVideo', video);
        });
        videos.chooseRandomVideo();
      });
    }
    else {
      // Playlist is already downloaded.
      this.trigger('playlists:newVideoList', videos);
      videos.chooseRandomVideo();
    }

    console.log('playlist: ' + this.selectedPlaylist.get('title'));
  }
}),

VideoPlayer = Backbone.View.extend({
  el: $('#videoPlayerContainer'),

  initialize: function() {
    _.bindAll(this, 'handleRandomVideo', 'render');
    this.videoPlayerTemplate = _.template('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/<%= youtube_id %>?autoplay=1" frameborder="0"></iframe>');

    return this;
  },

  render: function() {
    var playerHtml = this.currVideo ? this.videoPlayerTemplate(this.currVideo.toJSON()) : '';
    if (playVideo) {
      this.el.html(playerHtml);
    }
  },

  handleRandomVideo: function(video) {
    this.currVideo = video;
    this.render();
  },
}),

RouletteWheel = Backbone.View.extend({
  el: $('#chooser'),

  initialize: function() {
    _.bindAll(this, 'render',
                    'handleRandomItem',
                    'handleRandomPlaylist',
                    'handleRandomVideo',
                    'resetVideoList');

    this.playlistEl = $('#playlist');
    this.videoEl = $('#video');
    this.playlistItemTemplate = _.template('<li id="playlist-<%= youtube_id %>" class="playlistItem wheelItem"><%= title %></li>');
    this.videoItemTemplate = _.template('<li id="video-<%= youtube_id %>" class="playlistItem wheelItem"><%= title %></li>');

    this.render();
  },

  render: function() {
    var wheelEl = this.playlistEl.find('.wheel'),
        wheelHtml = '',
        _this = this,
        i, len;

    this.collection.each(function(playlistObj) {
      wheelHtml += _this.playlistItemTemplate(playlistObj.toJSON());
    });
    wheelEl.html(wheelHtml);
  },

  handleRandomItem: function(item, type) {
    // Decomposed method for scrolling wheels for random playlists and videos
    var idPrefix = (type === 'playlist') ? 'playlist-' : 'video-',
        itemId = [idPrefix, item.get('youtube_id')].join(''),
        itemEl = $('#' + itemId),
        containerEl = (type === 'playlist') ? this.playlistEl : this.videoEl,
        wheelContainerEl = containerEl.children('.wheelContainer'),
        wheelEl = containerEl.find('.wheel'),
        newTop = (itemEl.offset().top - wheelEl.offset().top)*(-1);
        // next line is just for centering the item in the wheel
        newTop += wheelContainerEl.height()/2 - itemEl.height()/2 - parseInt(itemEl.css('padding-top'), 10)*2;

    if (type === 'video') {
      wheelEl = wheelEl.filter('.selected');
    }
    wheelEl.css('top', newTop);
  },

  handleRandomPlaylist: function(playlist) {
    // Scroll playlist to top of the playlist wheel.
    this.handleRandomItem(playlist, 'playlist');
  },

  handleRandomVideo: function(video) {
    this.handleRandomItem(video, 'video');
  },

  resetVideoList: function(videos) {
    var videoListEl = $('#' + videos.playlistId),
        wheelHtml = '',
        _this = this,
        newEl;

    if (!videoListEl.length) {
      // List element hasn't been constructed yet
      newEl = $('<ul>').attr('id', 'videos-'+videos.playlistId)
                       .addClass('videoList wheel');

      videos.each(function(video) {
        wheelHtml += _this.videoItemTemplate(video.toJSON());
      });

      newEl.html(wheelHtml);
      $('#video .wheelContainer').append(newEl);
      newEl.addClass('selected')
           .siblings('ul').removeClass('selected');
    }
    else {
      // element already exists.
      videoListEl.addClass('selected')
                 .siblings('ul').removeClass('selected');
    }
  }
}),

VideoChooser = function() {
  var chooser = {
    init: function() {
      _.bindAll(this, 'populatePlaylists',
                      'chooseVideo',
                      'setupBindings',
                      'playRandomVideo');

      this.player = new VideoPlayer();

      $.getJSON('http://www.khanacademy.org/api/playlists', this.populatePlaylists);

      $('#rouletteBtn').click(this.playRandomVideo);

      return this;
    },

    populatePlaylists: function(data) {
      this.playlists = new Playlists(data);
      this.wheel     = new RouletteWheel({ collection: this.playlists });
      this.setupBindings();
    },

    chooseVideo: function() {
      var videoList = this.collection.playlistVideos[this.currPlaylist.title],
          rand = Math.floor(Math.random() * videoList.length);

      return videoList[rand];

      // Set video title
    },

    setupBindings: function() {
      this.playlists.bind('randomPlaylist', this.wheel.handleRandomPlaylist);
      this.playlists.bind('playlists:randomVideo', this.wheel.handleRandomVideo);
      this.playlists.bind('playlists:randomVideo', this.player.handleRandomVideo);
      this.playlists.bind('playlists:newVideoList', this.wheel.resetVideoList);
    },

    playRandomVideo: function(evt) {
      // click handler for roulette button
      var _this = this;

      evt.preventDefault();

      this.video = this.playlists.selectRandomVideo();
    }
  };

  return chooser.init();
};

$(function() {
  var chooser = new VideoChooser();
  playVideo = $('#playVideo').attr('checked') === 'checked';
  $('#playVideo').on('change', function(evt) {
    playVideo = !playVideo;
  });
});
