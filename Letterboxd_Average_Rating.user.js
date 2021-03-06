// ==UserScript==
// @name        Letterboxd Average Rating
// @namespace   https://github.com/soyguijarro/userscripts
// @description Adds average rating of film to film pages
// @copyright   2014+, Ramón Guijarro (http://soyguijarro.com)
// @homepageURL https://github.com/soyguijarro/userscripts
// @supportURL  https://github.com/soyguijarro/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/soyguijarro/userscripts/master/Letterboxd_Average_Rating.user.js
// @icon        https://raw.githubusercontent.com/soyguijarro/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.4
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

var sectionElt = document.getElementsByClassName("ratings-histogram-chart")[0],
    ratingsPageUrl = sectionElt.getElementsByTagName("a")[0].href,
    dataElt = sectionElt.querySelector("span.average-rating meta"),
    oneToTenRating = parseFloat(dataElt.getAttribute("content")),
    oneToFiveRating = (oneToTenRating / 2).toFixed(1),
    ratingElt = document.createElement("a"),
    ratingInnerElt = document.createElement("span");

// Create element to be inserted in page
ratingElt.className = "rating-green tooltip";
ratingElt.style.position = "absolute";
ratingElt.style.top = "0";
ratingElt.style.left = "72px";
ratingElt.href = ratingsPageUrl;
ratingElt.setAttribute("title", oneToFiveRating + " stars" +
    " (" + oneToTenRating + "/10)");
ratingInnerElt.className = "rating rated-" + Math.round(oneToTenRating);
ratingElt.appendChild(ratingInnerElt);

// Insert element in page
sectionElt.insertBefore(ratingElt, sectionElt.children[1]);