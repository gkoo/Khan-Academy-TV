$(function() {
  var $about = $('#about-overlay');

  $('#whatisthis').click(function(evt) {
    $about.show();
    evt.preventDefault();
  });
  $about.click(function(evt) {
    var $target = $(evt.target);
    if ($target.attr('id') === 'about-overlay' || $target.hasClass('close')) {
      $about.hide();
    }
    evt.preventDefault();
  });
});
