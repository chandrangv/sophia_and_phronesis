attrib -r www\*.* /s
del www\css\bundle.css
del www\scripts\bundle.js
call gulp build
call cordova run windows