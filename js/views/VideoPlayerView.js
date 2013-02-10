var VideoPlayerView = Backbone.View.extend({
  el: $('#videoPlayerContainer'),

  initialize: function() {
    _.bindAll(this);
    return this;
  },

  template: _.template('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/<%= youtube_id %>?autoplay=1" frameborder="0"></iframe>'),

  render: function() {
    var playerHtml = this.currVideoId ? this.template({ youtube_id: this.currVideoId }) : '';
    this.$el.html(playerHtml);
    this.$el.addClass('show');
  },

  playVideo: function(youtube_id) {
    this.currVideoId = youtube_id;
    this.render();
  }
});
