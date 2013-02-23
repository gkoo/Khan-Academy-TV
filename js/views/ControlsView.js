var ControlsView = Backbone.View.extend({
  el: $('#controls'),

  initialize: function() {
    _.bindAll(this);
    //_.extend(this, Backbone.Events);

    this.playlistsView = new PlaylistsView({ el: $('#playlists') });
    this.videosView = new VideosView({ el: $('#videos') });
    this.categoriesView = new CategoriesView({ el: $('#categories') });
    this.subcategoriesView = new SubcategoriesView({ el: $('#subcategories') });
  },

  setCollections: function(obj) {
    this.playlistsView.collection = obj.playlists;
    this.playlistsView.render();

    this.videosView.collection = obj.videos;

    this.categoriesView.collection = obj.categories;
    this.categoriesView.render();

    this.subcategoriesView.collection = obj.subcategories;

    return this;
  }
});
