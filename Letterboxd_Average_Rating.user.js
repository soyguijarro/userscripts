// ==UserScript==
// @name        Letterboxd Average Rating
// @namespace   https://github.com/rcalderong/userscripts
// @description Adds average rating of film to film pages
// @copyright   2014+, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_Average_Rating.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.2
// @include     /^http:\/\/(www.)?letterboxd.com\/film\/[\w|\-]+\/$/
// @grant       none
// ==/UserScript==

(function () {
    var newElt,         // Element with average rating to be inserted in page
        newInnerElt,    // Element with average rating to be inserted in page
        rating5,        // Average rating of the film in a five-star scale
        rating10,       // Average rating of the film in a one-to-ten scale
        ratingsElt;     // Page element of the ratings section

    // Get average rating from page metadata
    ratingsElt = document.querySelector("section.ratings-histogram-chart");
    rating10 = parseFloat(ratingsElt.querySelector("span.average-rating meta").
        getAttribute("content"));
    rating5 = (rating10 / 2).toFixed(1);

    // Create element to be inserted in page
    newElt = document.createElement("a");
    newElt.className = "rating-green tooltip";
    newElt.setAttribute("href",
        ratingsElt.querySelector("h3 a").getAttribute("href"));
    newElt.setAttribute("title", rating5 + " stars" + " (" + rating10 + "/10)");
    newElt.setAttribute("style", "position: absolute; top: 0; left: 72px;");
    newInnerElt = document.createElement("span");
    newInnerElt.className = "rating rated-" + Math.round(rating10);
    newElt.appendChild(newInnerElt);

    // Insert element in page
    ratingsElt.insertBefore(newElt, ratingsElt.children[1]);
}());