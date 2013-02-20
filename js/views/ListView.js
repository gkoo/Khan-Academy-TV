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

  clickHelper: function(evt, eventName) {
    var $target = $(evt.target),
        $parent = $target.parent(),
        id = $parent.attr('id');

    id = id.substring(id.indexOf('-')+1);
    eventsMediator.trigger(eventName, id);
    evt.preventDefault();
  },

  highlightHelper: function($elToHighlight) {
    this.$el.find('.dropdown-item a.selected')
            .removeClass('selected');
    $elToHighlight.addClass('selected');
  },

  render: function() {
    var id          = this.selectionId,
        $dropdownEl = this.$el.children('.dropdown'),
        html        = '',
        models,
        i,
        len;

    if (_.isEmpty(this.collection)) {
      $dropdownEl.children().hide();
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
      $dropdownEl.children().hide();
    }
    return this;
  },

  setTemplate: function(template) {
    this.template = template;
  }
});
