var VideoDialsView = Backbone.View.extend({
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
    var $el = $(evt.target),
        dialEl,
        id;

    // Determine what dial was clicked.
    if ($el.parentsUntil('#dials').length > 0) {
      id = $el.attr('id');

      this.rotateDial(id);
      eventsMediator.trigger('dials:randomVideo');
    }
    evt.preventDefault();
  }
});
