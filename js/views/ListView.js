/**
 * Superclass for PlaylistsView and VideosView
 */
var ListView = Backbone.View.extend({
  initialize: function() {
    _.extend(this, Backbone.Events);
    _.bindAll(this);
  },

  events: {
    'click': 'handleClick'
  },

  render: function() {
    var html = '',
        models,
        i,
        len;

    if (_.isEmpty(this.collection)) {
      this.$el.children('.dropdown').hide();
    }
    else {
      models = this.collection.models;
      for (i = 0, len = models.length; i < len; ++i) {
        html += this.template(models[i].toJSON());
      }
      this.$el.children('.dropdown').html(html).show();
    }
  },

  handleRandomItem: function(id, type, highlight) {
    // Decomposed method for scrolling wheels for random playlists and videos
    var idPrefix         = (type === 'playlist') ? 'playlist-' : 'video-',
        itemId           = [idPrefix, id].join(''),
        containerEl      = (type === 'playlist') ? this.$playlistEl : this.$videoEl,
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

  setTemplate: function(template) {
    this.template = template;
  }
});
