// ==UserScript==
// @name        Letterboxd Backdrop Remover
// @namespace   https://github.com/emg/userscripts
// @description Removes backdrop image from film pages
// @copyright   2014+, Ramón Guijarro (http://soyguijarro.com)
// @homepageURL https://github.com/soyguijarro/userscripts
// @supportURL  https://github.com/soyguijarro/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/soyguijarro/userscripts/master/Letterboxd_Backdrop_Remover.user.js
// @icon        https://raw.githubusercontent.com/soyguijarro/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.3
// @include     *://letterboxd.com/film/*
// @include     *://letterboxd.com/film/*/crew/*
// @include     *://letterboxd.com/film/*/studios/*
// @include     *://letterboxd.com/film/*/genres/*
// @exclude     *://letterboxd.com/film/*/views/*
// @exclude     *://letterboxd.com/film/*/lists/*
// @exclude     *://letterboxd.com/film/*/likes/*
// @exclude     *://letterboxd.com/film/*/fans/*
// @exclude     *://letterboxd.com/film/*/ratings/*
// @exclude     *://letterboxd.com/film/*/reviews/*
// @grant       none
// ==/UserScript==

var containerElt = document.getElementById("content"),
    backdropElt = document.getElementById("backdrop"),
    contentElt = backdropElt.getElementsByClassName("content-wrap")[0];

containerElt.replaceChild(contentElt, backdropElt);
containerElt.classList.remove("has-backdrop");