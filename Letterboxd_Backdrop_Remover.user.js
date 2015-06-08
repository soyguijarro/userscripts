// ==UserScript==
// @name        Letterboxd Backdrop Remover
// @namespace   https://github.com/rcalderong/userscripts
// @description Removes backdrop image from film pages
// @copyright   2014+, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_Backdrop_Remover.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.2
// @include     http://letterboxd.com/film/*
// @include     http://letterboxd.com/film/*/crew/*
// @include     http://letterboxd.com/film/*/studios/*
// @include     http://letterboxd.com/film/*/genres/*
// @exclude     http://letterboxd.com/film/*/views/*
// @exclude     http://letterboxd.com/film/*/lists/*
// @exclude     http://letterboxd.com/film/*/likes/*
// @exclude     http://letterboxd.com/film/*/fans/*
// @exclude     http://letterboxd.com/film/*/ratings/*
// @exclude     http://letterboxd.com/film/*/reviews/*
// @grant       none
// ==/UserScript==

var containerElt = document.getElementById("content"),
    backdropElt = document.getElementById("backdrop"),
    contentElt = backdropElt.getElementsByClassName("content-wrap")[0];

containerElt.replaceChild(contentElt, backdropElt);
containerElt.classList.remove("has-backdrop");