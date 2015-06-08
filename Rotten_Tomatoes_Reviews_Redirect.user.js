// ==UserScript==
// @name        Rotten Tomatoes Reviews Redirect
// @namespace   https://github.com/rcalderong/userscripts
// @description Redirects movie pages to their corresponding reviews pages
// @copyright   2015, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Rotten_Tomatoes_Reviews_Redirect.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.0
// @include     http://www.rottentomatoes.com/m/*
// @include     http://www.rottentomatoes.com/m/*/reviews/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

var reviewsPageMatch = /reviews(\/\?type=(\w+))*/.exec(window.location);

if (reviewsPageMatch) { // Save current reviews type
    localStorage.reviewType = reviewsPageMatch[2] || "";
} else {    // Redirect to reviews page
    window.location.replace(window.location.toString().replace(/\/$/, "") +
        "/reviews/?type=" + (localStorage.reviewType || ""));
}