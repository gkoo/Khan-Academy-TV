var PlaylistCollection=Backbone.Collection.extend({initialize:function(){_.extend(this,Backbone.Events);_.bindAll(this,"getRandomPlaylist","selectRandomPlaylist","selectRandomVideo","loadPlaylist","fetchVideosForPlaylist");return this},getRandomPlaylist:function(){var a;if(0>=this.length)return alert("Error! No playlists..."),null;a=Math.floor(Math.random()*this.length);return this.at(a)},selectRandomPlaylist:function(a){a="undefined"!==typeof a?a:!1;this.selectedPlaylist=this.getRandomPlaylist();
this.trigger("playlists:randomPlaylist",{playlist:this.selectedPlaylist,highlight:a})},selectRandomVideo:function(){var a,b=this;this.selectRandomPlaylist(!0);a=this.selectedPlaylist.get("videos");!a||!a.length?this.fetchVideosForPlaylist(this.selectedPlaylist,function(a){b.trigger("playlists:newVideoList",a);a.chooseRandomVideo()}):(this.trigger("playlists:newVideoList",a),a.chooseRandomVideo())},loadPlaylist:function(a){var b;this.selectedPlaylist=this.getPlaylistById(a);(b=this.selectedPlaylist.get("videos"))&&
b.length?eventsMediator.trigger("playlists:newVideoList",b):this.fetchVideosForPlaylist(a,function(a){eventsMediator.trigger("playlists:newVideoList",a)})},fetchVideosForPlaylist:function(a,b){var c;c="string"===typeof a?this.getPlaylistById(a):a;$.getJSON("http://www.khanacademy.org/api/v1/playlists/"+c.id+"/videos",function(){b&&b(void 0)})}});var VideoCollection=Backbone.Collection.extend({initialize:function(){_.bindAll(this,"chooseRandomVideo");_.extend(this,Backbone.Events)},chooseRandomVideo:function(){var a;0>=this.length?alert("Error! No videos..."):(a=Math.floor(Math.random()*this.length),this.trigger("videos:randomVideo",this.at(a)))}});var CategoriesView=ListView.extend({template:_.template('<li id="category-<%= id %>" class="dropdown-item"><a href="#"><%= title %></a></li>'),handleClick:function(a){this.clickHelper(a,"controls:loadCategory")},setHighlight:function(a){a=$("#category-"+a.categoryId).children("a");this.highlightHelper(a)},selectionObj:void 0,selectionId:void 0});var ControlsView=Backbone.View.extend({el:$("#controls"),initialize:function(){_.bindAll(this);this.playlistsView=new PlaylistsView({el:$("#playlists")});this.videosView=new VideosView({el:$("#videos")});this.categoriesView=new CategoriesView({el:$("#categories")});this.subcategoriesView=new SubcategoriesView({el:$("#subcategories")});this.$playlistEl=$("#playlists");this.$videoEl=$("#videos");this.$videoInfoEl=$("#videoInfo");this.constructVideoInfoTemplate();this.render()},render:function(){this.playlistsView.render();
this.videosView.render()},setCollections:function(a){this.playlistsView.collection=a.playlists;this.playlistsView.render();this.videosView.collection=a.videos;this.categoriesView.collection=a.categories;this.categoriesView.render();this.subcategoriesView.collection=a.subcategories;return this},constructVideoInfoTemplate:function(){var a;a='<table class="infoTable">  <tr valign="top"><th>Title</th><td><%= title %></td></tr>';a+='  <tr valign="top"><th>Desc</th><td><%= description %></td></tr>';a+=
'  <tr valign="top"><th>Views</th><td><%= views %></td></tr>';a+="</table>";a+='<p><a href="<%= ka_url %>">View this video on the Khan Academy website</a></p>';this.videoInfoTemplate=_.template(a)},populateVideoInfo:function(a){a=this.videoInfoTemplate(a.toJSON());this.$videoInfoEl.find(".metadata").html(a);return this},handleRandomPlaylist:function(a){this.handleRandomItem(a.playlist.id,"playlist",a.highlight)},handleRandomVideo:function(a){this.handleRandomItem(a.id,"video",!0);this.populateVideoInfo(a)},
resetVideoList:function(a){var b=$("#videos-"+a.playlistId),c="",d=this,e=$("#video .wheelContainer");b.length?b.hasClass("selected")||b.addClass("selected").siblings("ul").removeClass("selected"):(b=$("<ul>").attr("id","videos-"+a.playlistId).addClass("video-list"),a.each(function(a){c+=d.videoItemTemplate(a.toJSON())}),b.html(c),e.append(b),b.addClass("selected").siblings(".selected").removeClass("selected"),this.makeDraggable(b,e))},makeDraggable:function(a,b){b.offset();b.height();a.height();
a.draggable({axis:"y",distance:5})}});var ListView=Backbone.View.extend({initialize:function(){_.bindAll(this)},events:{click:"handleClick"},clickHelper:function(a,b){var c=$(a.target).parent().attr("id"),c=c.substring(c.indexOf("-")+1);eventsMediator.trigger(b,c);a.preventDefault()},highlightHelper:function(a){this.$el.find(".dropdown-item a.selected").removeClass("selected");a.addClass("selected")},render:function(){var a=this.selectionId,b=this.$el.children(".dropdown"),c="",d,e;if(_.isEmpty(this.collection))b.children().hide();else if(this.selectionObj)if(a){$items=
this.$el.find(".for-"+a);if(0===$items.length){a=this.collection.where(this.selectionObj);if(_.isEmpty(a))throw"No models found for current selection!";d=0;for(e=a.length;d<e;++d)c+=this.template(a[d].toJSON());this.$el.find(".dropdown-item").hide();b.append($(c))}else this.$el.find(".dropdown-item").not($items).hide(),$items.show();b.show()}else b.children().hide();else{a=this.collection.models;d=0;for(e=a.length;d<e;++d)c+=this.template(a[d].toJSON());b.html(c).show()}return this},setTemplate:function(a){this.template=
a}});var PlaylistsView=ListView.extend({template:_.template('<li id="playlist-<%= id %>" class="dropdown-item"><a href="#"><%= title %></a></li>'),handleClick:function(a){this.clickHelper(a,"controls:loadPlaylist")},reload:function(a){a.categoryId!==this.selectionObj.categoryId&&(this.selectionObj.categoryId="",this.selectionId=this.selectionObj.subcategoryId="",this.render())},loadSubcategory:function(a){this.selectionObj.categoryId=a.categoryId;this.selectionId=this.selectionObj.subcategoryId=a.subcategoryId;
this.render()},setHighlight:function(a){a=$("#playlist-"+a.playlistId).children("a");this.highlightHelper(a)},selectionObj:{},selectionId:""});var SubcategoriesView=ListView.extend({template:_.template('<li id="subcategory-<%= id %>" class="dropdown-item for-<%= categoryId %>"><a href="#"><%= title %></a></li>'),loadCategory:function(a){this.selectionObj.categoryId=a.categoryId;this.selectionObj.subcategoryId=a.subcategoryId;this.selectionId=a.categoryId;this.render()},handleClick:function(a){this.clickHelper(a,"controls:loadSubcategory")},setHighlight:function(a){a=$("#subcategory-"+a.subcategoryId).children("a");this.highlightHelper(a)},
selectionObj:{},selectionId:""});var VideoDialsView=Backbone.View.extend({el:$("#dials"),initialize:function(){_.extend(this,Backbone.Events);_.bindAll(this,"rotateDial","handleClick");this.videoDialRotate=this.playlistDialRotate=0;this.rotateDial("playlistDial");this.rotateDial("videoDial")},events:{click:"handleClick"},rotateDial:function(a,b){var c=$("#"+a+" .spinnerThingy");"undefined"===typeof b&&(b=Math.floor(360*Math.random())+360,Math.floor(2*Math.random())&&(b*=-1));"playlistDial"===a?this.playlistDialRotate=b+=this.playlistDialRotate:
this.videoDialRotate=b+=this.videoDialRotate;rotateValStr="rotate("+b+"deg)";c.css({"-moz-transform":rotateValStr,"-webkit-transform":rotateValStr,"-o-transform":rotateValStr,transform:rotateValStr})},handleClick:function(a){var b=$(a.target);0<b.parentsUntil("#dials").length&&(b=b.attr("id"),this.rotateDial(b),eventsMediator.trigger("dials:randomVideo"));a.preventDefault()}});var VideoInfoView=Backbone.View.extend({el:$("#videoInfo"),initialize:function(){var a;a='<h2 class="label"><%= title %></h2><div class="content">';a+="<p><%= description %></p>";a+="<p><%= views %> views</p>";a+='<p><a href="<%= ka_url %>">View this video on the Khan Academy website</a></p>';a+="</div>";this.template=_.template(a)},render:function(a){this.$el.html(this.template(a))}});var VideoPlayerView=Backbone.View.extend({el:$("#videoPlayerContainer"),initialize:function(){_.bindAll(this);return this},template:_.template('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/<%= youtube_id %>?autoplay=1" frameborder="0"></iframe>'),render:function(){var a=this.currVideoId?this.template({youtube_id:this.currVideoId}):"";this.$el.html(a);this.$el.addClass("show")},playVideo:function(a){this.currVideoId=a;this.render()}});var VideosView=ListView.extend({template:_.template('<li id="video-<%= id %>" data-youtube-id="<%= youtube_id %>" class="dropdown-item for-playlist-<%= playlistId %>"><a href="#"><%= title %></a></li>'),handleClick:function(a){var b=$(a.target).parent().attr("id").substring(6);eventsMediator.trigger("controls:playVideo",b);a.preventDefault()},reload:function(a){if(a.categoryId!==this.selectionObj.categoryId||a.subcategoryId!==this.selectionObj.subcategoryId)this.selectionObj.categoryId="",this.selectionObj.subcategoryId=
"",this.selectionId=this.selectionObj.playlistId="",this.render()},loadPlaylist:function(a){this.selectionObj.categoryId=a.categoryId;this.selectionObj.subcategoryId=a.subcategoryId;this.selectionId=this.selectionObj.playlistId=a.playlistId;this.render()},setHighlight:function(a){a=$("#video-"+a).children("a");this.highlightHelper(a)},selectionObj:{},selectionId:""});var VideoChooser=function(){this.initialize()};
VideoChooser.prototype={selection:{},initialize:function(){var a;_.bindAll(this);this.player=new VideoPlayerView;this.dials=new VideoDialsView;debug?(a=window.location.href,a=a.substring(0,a.lastIndexOf("/")+1)+"playlists.json"):a="http://www.khanacademy.org/api/v1/playlists";$.getJSON(a,this.populatePlaylists);$("#rouletteBtn").click(this.playRandomVideo);Array.prototype.getRandomItem=function(){return this[Math.floor(Math.random()*this.length)]};return this},populatePlaylists:function(a){var b=
[],c={},d=[],e=[];_.each(a,function(a){var d={},e=a.extended_slug;if(e=e?e.split("/"):"")d.categoryId=e[0],d.subcategoryId=1<e.length?e[1]:d.categoryId;_.isEmpty(c[d.categoryId])&&(c[d.categoryId]={});_.isEmpty(c[d.categoryId][d.subcategoryId])&&(c[d.categoryId][d.subcategoryId]=1);d.id=a.id.replace(/['"]/g,"");d.url_id=a.id;d.title=a.title;b.push(d)});for(cat in c)for(subcat in a=cat.split("-"),a[0]=a[0][0].toUpperCase()+a[0].substring(1),d.push({id:cat,title:a.join(" ")}),c[cat])a=subcat.split("-"),
a[0]=a[0][0].toUpperCase()+a[0].substring(1),("core-finance"!==subcat||"finance-economics"===cat)&&e.push({id:subcat,title:a.join(" "),categoryId:cat});this.categories=new Backbone.Collection(d);this.subcategories=new Backbone.Collection(e);this.playlists=new PlaylistCollection(b);this.videos=new VideoCollection;this.controls=new ControlsView;this.videoInfo=new VideoInfoView;this.controls.setCollections({playlists:this.playlists,videos:this.videos,categories:this.categories,subcategories:this.subcategories});
this.setupBindings()},setupBindings:function(){eventsMediator.bind("controls:loadCategory",this.loadCategory);eventsMediator.bind("chooser:loadCategory",this.controls.categoriesView.setHighlight);eventsMediator.bind("chooser:loadCategory",this.controls.subcategoriesView.loadCategory);eventsMediator.bind("chooser:loadCategory",this.controls.playlistsView.reload);eventsMediator.bind("chooser:loadCategory",this.controls.videosView.reload);eventsMediator.bind("controls:loadSubcategory",this.loadSubcategory);
eventsMediator.bind("chooser:loadSubcategory",this.controls.subcategoriesView.setHighlight);eventsMediator.bind("chooser:loadSubcategory",this.controls.playlistsView.loadSubcategory);eventsMediator.bind("chooser:loadSubcategory",this.controls.videosView.reload);eventsMediator.bind("controls:loadPlaylist",this.loadPlaylist);eventsMediator.bind("chooser:loadPlaylist",this.controls.playlistsView.setHighlight);eventsMediator.bind("chooser:loadPlaylist",this.controls.videosView.loadPlaylist);eventsMediator.bind("dials:randomVideo",
this.playRandomVideo);eventsMediator.bind("controls:playVideo",this.playVideo);eventsMediator.bind("controls:playVideo",this.controls.videosView.setHighlight)},loadCategory:function(a){var a="string"===typeof a?a:a.id,b=this.selection.categoryId!==a,c=b?void 0:this.selection.subcategoryId,b=b?void 0:this.selection.playlistId;this.selection.categoryId=a;this.selection.subcategoryId=c;this.selection.playlistId=b;eventsMediator.trigger("chooser:loadCategory",this.selection)},loadSubcategory:function(a){var a=
"string"===typeof a?a:a.id,b=this.selection.subcategoryId!==a?void 0:this.selection.playlistId;this.selection.subcategoryId=a;this.selection.playlistId=b;eventsMediator.trigger("chooser:loadSubcategory",this.selection)},loadPlaylist:function(a,b){var c="string"===typeof a?a:a.id,d=this.videos.where({playlistId:c}),e=this;this.selection.playlistId=c;_.isEmpty(d)?this.fetchVideosForPlaylist(a,function(){eventsMediator.trigger("chooser:loadPlaylist",e.selection);b&&b()}):(eventsMediator.trigger("chooser:loadPlaylist",
this.selection),b())},fetchVideosForPlaylist:function(a,b){var c,d=this;c="string"===typeof a?this.playlists.get(a):a;$.getJSON("http://www.khanacademy.org/api/v1/playlists/"+c.get("url_id")+"/videos",function(a){var f=[];_.each(a,function(a){f.push({id:a.readable_id,youtube_id:a.youtube_id,title:a.title,description:a.description,views:a.views,ka_url:a.ka_url,categoryId:d.selection.categoryId,subcategoryId:d.selection.subcategoryId,playlistId:c.id})});d.videos.add(f);b&&b(void 0)})},playRandomVideo:function(){var a,
b,c,d=this;a=this.categories.at(Math.floor(Math.random()*this.categories.length));this.loadCategory(a);b=this.subcategories.where({categoryId:a.id}).getRandomItem();this.loadSubcategory(b);c=this.playlists.where({categoryId:a.id,subcategoryId:b.id}).getRandomItem();this.loadPlaylist(c,function(){var a=d.videos.where({playlistId:c.id}).getRandomItem();eventsMediator.trigger("controls:playVideo",a.id)})},playVideo:function(a){var b=this.videos.get(a);if(0===b.length)throw"No video found for this Youtube id. Something is wrong!";
this.selection.videoId=a;this.player.playVideo(b.get("youtube_id"));this.videoInfo.render(b.toJSON())}};
