var VideoCollection = Backbone.Collection.extend({
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
});
