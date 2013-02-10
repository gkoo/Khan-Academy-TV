var PlaylistsView = ListView.extend({
  template: _.template('<li id="playlist-<%= id %>" class="playlist-item"><a href="#"><%= title %></a></li>'),

  handleClick: function(evt) {
    var $target = $(evt.target),
        $parent = $target.parent(),
        id;

    evt.preventDefault();
    if ($target[0].nodeName === 'A' && $parent.hasClass('playlist-item')) {
      id = $parent.attr('id').substring(9);
      //this.handleRandomItem(id, 'playlist', true);
      eventsMediator.trigger('controls:loadPlaylist', id);
    }
  },
});
