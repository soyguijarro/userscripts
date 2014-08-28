// ==UserScript==
// @name        Letterboxd Backdrop Remover
// @namespace   https://github.com/rcalderong/userscripts
// @description Removes backdrop image from film pages
// @copyright   2014, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_Backdrop_Remover.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.1
// @include     /^http:\/\/(www.)?letterboxd.com\/film\/[\w|\-]+\/$/
// @grant       none
// ==/UserScript==

(function () {
    // Only execute if page has a backdrop
    if (document.getElementsByClassName("has-backdrop").length > 0) {
        var container = document.getElementById("content"),
            backdrop = container.children[0],
            content = backdrop.children[0].children[0];

        // Remove backdrop and make remaining content take the space
        container.replaceChild(content, backdrop);
        container.removeAttribute("class"); // has-backdrop class
    }
}());