# Maple-Gulp * Sass - Handlebars template :zap:

---
 [![Version](https://img.shields.io/badge/version-0.2-brightgreen.svg)]()

 ![Maple](https://img.shields.io/badge/Maple-Studio-orange.svg)

## Features :sparkles: : 
+ Sass/scss , css prefix , css nano  :white_check_mark:
+ Babel es6  :white_check_mark:
+ Handlebars template for mudularize html  :white_check_mark:
+ BrowserSync Live reload :white_check_mark:
+ Optimize for production : Minify html,css,image :white_check_mark:
+ PageSpeed Insights :white_check_mark:
+ Deploy to surge.sh :white_check_mark:
+ Add more :yum: 

## Require :smiley_cat: :
 - gulp [npm i -g gulp]
 - node sass [more info](https://github.com/sass/node-sass)
 - On window check node-gyp [this](https://github.com/nodejs/node-gyp#on-windows)
 - python 2.7


## Dev workflow :cyclone: : 
``` 
├── app (Dev folder)
├── dist (Build product folder)
├── ...
```
## App folder structure :flashlight: :
```
./app
├── favicon.ico 
├── humans.txt
├── images [Folder]
├── index.html
├── manifest.json
├── manifest.webapp
├── robots.txt
├── js  [Folder] <- [App js logic]
├── scripts [Folder]
├── service-worker.js
├── styles  [Folder] <- [Style scss here]
└── template  [Folder] <- [Edit template here]
```
## Run :electric_plug: :

+ Local dev : ```gulp ```
+ Build production : ``` gulp build``` 
+ Server production build: ``` gulp serve:dist ```
+ Deploy to surge server : ``` gulp surge -d [name of project] ```


## (C) 11/2017 - 001123 - maplestudio :memo:   