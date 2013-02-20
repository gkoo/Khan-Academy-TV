var VideoDialsView = Backbone.View.extend({
  el: $('#dials'),

  initialize: function() {
    _.extend(this, Backbone.Events);
    _.bindAll(this, 'rotateDial',
                    'handleClick');

    this.playlistDialRotate = 0;
    this.videoDialRotate = 0;

    this.rotateDial();
  },

  events: {
    'click': 'handleClick'
  },

  rotateDial: function(rotateVal) {
    var el = $('#videoDial .spinnerThingy');
    if (typeof rotateVal === 'undefined') {
      // min rotate: 360, max rotate: 720
      rotateVal = Math.floor(Math.random()*360)+360;
      if (Math.floor(Math.random()*2)) {
        rotateVal *= (-1);
      }
    }
    rotateVal += this.videoDialRotate;
    this.videoDialRotate = rotateVal;

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

      this.rotateDial();
      eventsMediator.trigger('dials:randomVideo');
    }
    evt.preventDefault();
  }
});
