// TODO: include/exclude specific playlists
// TODO: make dial spin when user scrolls on wheel(?)
// TODO: provide a way to get back to current video(?)
// TODO: filter out tokens with underscores from video descriptions
// TODO: figure out scroll containment bug.

var playVideo = 1,

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
  },
}),

Playlists = Backbone.Collection.extend({
  initialize: function() {
    _.extend(this, Backbone.Events);
    _.bindAll(this, 'getRandomPlaylist',
                    'selectRandomPlaylist',
                    'selectRandomVideo',
                    'getPlaylistById',
                    'loadPlaylist',
                    'fetchVideosForPlaylist');

    return this;
  },

  getRandomPlaylist: function() {
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

  getPlaylistById: function(youtube_id) {
    // use youtube_id because there's no other identifier =(
    return this.find(function(pl) {
      return pl.get('youtube_id') === youtube_id;
    });
  },

  loadPlaylist: function(youtube_id) {
    var _this = this,
        videos;

    this.selectedPlaylist = this.getPlaylistById(youtube_id);
    videos = this.selectedPlaylist.get('videos');

    if (videos && videos.length) {
      // Video list was already downloaded
      this.trigger('playlists:newVideoList', videos);
    }
    else {
      // Need to fetch video list
      this.fetchVideosForPlaylist(youtube_id, function(v) {
        _this.trigger('playlists:newVideoList', v);
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
}),

VideoPlayer = Backbone.View.extend({
  el: $('#videoPlayerContainer'),

  initialize: function() {
    _.bindAll(this, 'playVideo',
                    'render');
    this.videoPlayerTemplate = _.template('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/<%= youtube_id %>?autoplay=1" frameborder="0"></iframe>');

    return this;
  },

  render: function() {
    var playerHtml = this.currVideo ? this.videoPlayerTemplate(this.currVideo.toJSON()) : '';
    if (playVideo) {
      this.el.html(playerHtml);
      this.el.addClass('show');
    }
  },

  playVideo: function(video) {
    this.currVideo = video;
    this.render();
  }
}),

VideoDials = Backbone.View.extend({
  el: $('#dials'),

  initialize: function() {
    _.extend(this, Backbone.Events);
    _.bindAll(this, 'rotateDial',
                    'handleClick');

    this.playlistDialRotate = 0;
    this.videoDialRotate = 0;

    this.rotateDial('playlistDial');
    this.rotateDial('videoDial');
  },

  events: {
    'click': 'handleClick'
  },

  rotateDial: function(dialId, rotateVal) {
    var el = $('#' + dialId + ' .spinnerThingy');
    if (typeof rotateVal === 'undefined') {
      // min rotate: 360, max rotate: 720
      rotateVal = Math.floor(Math.random()*360)+360;
      if (Math.floor(Math.random()*2)) {
        rotateVal *= (-1);
      }
    }
    if (dialId === 'playlistDial') {
      rotateVal += this.playlistDialRotate;
      this.playlistDialRotate = rotateVal;
    }
    else {
      // dialId === 'videoDial'
      rotateVal += this.videoDialRotate;
      this.videoDialRotate = rotateVal;
    }

    rotateValStr = 'rotate(' + rotateVal + 'deg)';
    el.css({'-moz-transform':    rotateValStr,
            '-webkit-transform': rotateValStr,
            '-o-transform':      rotateValStr,
            'transform':         rotateValStr});
  },

  handleClick: function(evt) {
    var el = $(evt.target),
        dialEl,
        id;

    // Determine what dial was clicked.
    if (el.hasClass('dial')) {
      id = el.attr('id');
    }
    else {
      dialEl = el.parentsUntil('#dials', '.dial');
      if (dialEl.length) {
        id = dialEl.attr('id');
      }
      else {
        // clicked somewhere outside of the dials
        return;
      }
    }

    this.rotateDial(id);
    if (id === 'playlistDial') {
      this.trigger('dials:randomPlaylist');
    }
    else if (id === 'videoDial') {
      this.trigger('dials:randomVideo');
    }
  }
}),

RouletteWheel = Backbone.View.extend({
  el: $('#chooserWrapper'),

  initialize: function() {
    _.bindAll(this, 'render',
                    'constructVideoInfoTemplate',
                    'populateVideoInfo',
                    'handleRandomItem',
                    'handleRandomPlaylist',
                    'handleRandomVideo',
                    'handleClick',
                    'resetVideoList',
                    'makeDraggable');
    _.extend(this, Backbone.Events);

    this.playlistEl           = $('#playlist');
    this.videoEl              = $('#video');
    this.playlistItemTemplate = _.template('<li id="playlist-<%= id %>" class="playlistItem wheelItem"><%= title %></li>');
    this.videoItemTemplate    = _.template('<li class="video-<%= readable_id %> videoItem wheelItem" data-youtube-id="<%= youtube_id %>"><%= title %></li>');
    this.constructVideoInfoTemplate();

    this.render();
  },

  events: {
    'click': 'handleClick'
  },

  render: function() {
    var containerEl = this.playlistEl.children('.wheelContainer'),
        wheelEl = containerEl.children('.wheel'),
        wheelHtml = '',
        _this = this,
        i, len;

    this.collection.each(function(playlistObj) {
      wheelHtml += _this.playlistItemTemplate(playlistObj.toJSON());
    });
    wheelEl.html(wheelHtml);
    this.makeDraggable(wheelEl, containerEl);
  },

  constructVideoInfoTemplate: function() {
    var templateStr = '';
    templateStr += '<table class="infoTable">';
    templateStr += '  <tr valign="top"><th>Title</th><td><%= title %></td></tr>';
    //templateStr += '  <tr valign="top"><th>Playlists</th><td><%= playlist_titles.join(", ") %></td></tr>';
    templateStr += '  <tr valign="top"><th>Description</th><td><%= description %></td></tr>';
    templateStr += '  <tr valign="top"><th>Views</th><td><%= views %></td></tr>';
    templateStr += '</table>';
    templateStr += '<p><a href="<%= ka_url %>">View this video on the Khan Academy website</a></p>';
    this.videoInfoTemplate = _.template(templateStr);
  },

  populateVideoInfo: function(video) {
    var infoHtml = this.videoInfoTemplate(video.toJSON());
    $('#videoInfo').find('.wheelContainer').html(infoHtml);
  },

  handleRandomItem: function(id, type, highlight) {
    // Decomposed method for scrolling wheels for random playlists and videos
    var idPrefix         = (type === 'playlist') ? 'playlist-' : 'video-',
        itemId           = [idPrefix, id].join(''),
        containerEl      = (type === 'playlist') ? this.playlistEl : this.videoEl,
        wheelContainerEl = containerEl.children('.wheelContainer'),
        highlight        = (typeof highlight !== 'undefined') ? highlight : false,
        itemEl,
        wheelEl,
        newTop;

    if (type === 'playlist') {
      wheelEl = containerEl.find('.wheel');
      itemEl = $('#' + itemId);
    }
    else {
      // type === 'video'
      wheelEl = containerEl.find('.wheel.selected');
      itemEl = $('#video .wheel.selected .' + itemId);
    }
    newTop = (itemEl.offset().top - wheelEl.offset().top)*(-1);
    // next line is just for centering the item in the wheel
    newTop += wheelContainerEl.height()/2 - itemEl.height()/2 - parseInt(itemEl.css('padding-top'), 10)*2;

    if (type === 'video') {
      wheelEl = wheelEl.filter('.selected');
    }
    wheelEl.css('top', newTop + 'px');

    if (highlight) {
      itemEl.addClass('selected')
            .siblings('.selected').removeClass('selected');
      if (type === 'playlist') {
        this.selectedPlaylistEl = itemEl;
      }
      if (type === 'video') {
        this.selectedVideoEl = itemEl;
      }
    }
  },

  handleRandomPlaylist: function(o) {
    // Scroll playlist to top of the playlist wheel.
    this.handleRandomItem(o.playlist.id, 'playlist', o.highlight);
  },

  handleRandomVideo: function(video) {
    this.handleRandomItem(video.get('readable_id'), 'video', true);
    this.populateVideoInfo(video);
  },

  handleClick: function(evt) {
    var target = $(evt.target),
        youtube_id;

    evt.preventDefault();
    if (target.hasClass('playlistItem')) {
      youtube_id = target.attr('data-youtube-id');
      this.handleRandomItem(youtube_id, 'playlist', true);
      this.trigger('wheel:loadPlaylist', youtube_id);
    }
    else if (target.hasClass('videoItem')) {
      // time to play a video!
      youtube_id = target.attr('data-youtube-id');
      this.handleRandomItem(youtube_id, 'video', true);
      this.trigger('wheel:selectedVideo', youtube_id);
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

  resetVideoList: function(videos) {
    var videoListEl = $('#videos-' + videos.playlistId),
        wheelHtml = '',
        _this = this,
        container = $('#video .wheelContainer'),
        newEl;

    if (!videoListEl.length) {
      // List element hasn't been constructed yet
      newEl = $('<ul>').attr('id', 'videos-'+videos.playlistId)
                       .addClass('videoList wheel');

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
}),

VideoChooser = function() {
  var chooser = {
    initialize: function() {
      _.bindAll(this, 'populatePlaylists',
                      'chooseVideo',
                      'setupBindings',
                      'playRandomVideo',
                      'playVideo');

      this.player = new VideoPlayer();
      this.dials = new VideoDials();

      $.getJSON('http://www.khanacademy.org/api/v1/playlists', this.populatePlaylists);

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
      this.playlists.bind('playlists:randomPlaylist', this.wheel.handleRandomPlaylist);
      this.playlists.bind('playlists:randomVideo', this.wheel.handleRandomVideo);
      this.playlists.bind('playlists:randomVideo', this.player.playVideo);
      this.playlists.bind('playlists:newVideoList', this.wheel.resetVideoList);
      this.wheel.bind('wheel:loadPlaylist', this.playlists.loadPlaylist);
      this.wheel.bind('wheel:selectedVideo', this.playVideo);
      this.dials.bind('dials:randomPlaylist', this.playlists.selectRandomPlaylist);
      this.dials.bind('dials:randomVideo', this.playlists.selectRandomVideo);
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
      var playlist = this.playlists.selectedPlaylist;
          video = playlist.get('videos').find(function(v) {
            return v.get('youtube_id') === youtube_id;
          });

      this.player.playVideo(video);
      this.wheel.populateVideoInfo(video);
    }
  };

  return chooser.initialize();
};

$(function() {
  var chooser = new VideoChooser();
  // debug stuff
  // ===========
  /*
  playVideo = $('#playVideo').attr('checked') === 'checked';
  $('#playVideo').on('change', function(evt) {
    playVideo = !playVideo;
  });
  */
});
