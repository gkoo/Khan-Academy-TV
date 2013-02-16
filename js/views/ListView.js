/**
 * Superclass for PlaylistsView and VideosView
 */
var ListView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);
  },

  events: {
    'click': 'handleClick'
  },

  render: function() {
    var id          = this.selectionId,
        $dropdownEl = this.$el.children('.dropdown'),
        html        = '',
        models,
        i,
        len;

    if (_.isEmpty(this.collection)) {
      $dropdownEl.hide();
    }
    else if (!this.selectionObj) {
      // No selectionId to check for, so just show everything.
      models = this.collection.models;
      for (i = 0, len = models.length; i < len; ++i) {
        html += this.template(models[i].toJSON());
      }
      $dropdownEl.html(html).show();
    }
    else if (id) {
      // We have a selection to filter by!
      $items = this.$el.find('.for-' + id);
      if ($items.length === 0) {
        // Need to create DOM elements
        models = this.collection.where(this.selectionObj);

        if (_.isEmpty(models)) {
          throw "No models found for current selection!";
        }

        for (i = 0, len = models.length; i < len; ++i) {
          html += this.template(models[i].toJSON());
        }
        this.$el.find('.dropdown-item').hide();
        $dropdownEl.append($(html));
      }
      else {
        this.$el.find('.dropdown-item').not($items).hide();
        $items.show();
      }
      $dropdownEl.show();
    }
    else {
      // No selection to filter by. Hide!
      $dropdownEl.hide();
    }
    return this;
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
  },

  // Define the higher-level selections in this object.
  // Type: Object<String, String>
  selectionObj: undefined,

  // Define the current level selection id here.
  // Type: String
  selectionId: undefined
});
