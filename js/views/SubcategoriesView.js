var SubcategoriesView = ListView.extend({
  template: _.template('<li id="subcategory-<%= id %>" class="subcategory-item for-category-<%= categoryId %>"><a href="#"><%= title %></a></li>'),

  // This render should only be called once on application load.
  render: function() {
    var id = this.selectedCategoryId,
        html  = '',
        $dropdownEl = this.$el.children('.dropdown'),
        $subcategoryItems,
        subcategories;

    if (id) {
      $subcategoryItems = this.$el.find('.for-category-' + id);

      if ($subcategoryItems.length === 0) {
        subcategories = _.where(this.collection, { categoryId: id });

        if (_.isEmpty(subcategories)) {
          throw "No subcategories found for category " + id + "!";
        }

        for (i = 0, len = subcategories.length; i < len; ++i) {
          html += this.template(subcategories[i]);
        }
        this.$el.find('.subcategory-item').hide();
        $dropdownEl.append($(html));
      }
      else {
        this.$el.find('.subcategory-item').not($subcategoryItems).hide();
        $subcategoryItems.show();
      }
    }

  },

  loadCategory: function(categoryId) {
    this.selectedCategoryId = categoryId;
    this.render();
  },

  handleClick: function(evt) {
  }
});
