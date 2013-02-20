#!/bin/bash

echo ""
echo "Minifying files into assets.js..."
echo "================================="
echo "This script uses Google Closure Compiler (http://code.google.com/closure/compiler/) and assumes the location of the compiler is:"
echo "~/workspace/compiler-latest-1/compiler.jar"
echo ""
echo "INPUT FILES:"
echo "============"
echo "js/models/PlaylistCollection.js"
echo "js/models/VideoCollection.js"
echo "js/views/CategoriesView.js"
echo "js/views/ControlsView.js"
echo "js/views/ListView.js"
echo "js/views/PlaylistsView.js"
echo "js/views/SubcategoriesView.js"
echo "js/views/VideoDialsView.js"
echo "js/views/VideoInfoView.js"
echo "js/views/VideoPlayerView.js"
echo "js/views/VideosView.js"
echo "js/VideoChooser.js"

java -jar ~/workspace/compiler-latest-1/compiler.jar \
          --js=js/models/PlaylistCollection.js \
          --js=js/models/VideoCollection.js \
          --js=js/views/CategoriesView.js \
          --js=js/views/ControlsView.js \
          --js=js/views/ListView.js \
          --js=js/views/PlaylistsView.js \
          --js=js/views/SubcategoriesView.js \
          --js=js/views/VideoDialsView.js \
          --js=js/views/VideoInfoView.js \
          --js=js/views/VideoPlayerView.js \
          --js=js/views/VideosView.js \
          --js=js/VideoChooser.js > js/assets.js

echo "Done minifying js..."

echo "Compiling and minifying LESS..."
lessc -x less/style.less > css/style.css
echo "Done compiling and minifying LESS..."
