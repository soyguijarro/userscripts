// ==UserScript==
// @name        Letterboxd External Ratings
// @namespace   https://github.com/rcalderong/userscripts
// @description Adds ratings of film from external sites to film pages
// @copyright   2014, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_Average_Rating.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.0
// @include     /^http:\/\/(www.)?letterboxd.com\/film\/[\w|\-]+\/$/
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    function buildRatingsDisplay() {
        var ratings = {"IMDb": "", "Metacritic": ""},
            ratingsElt = document.querySelector("section.ratings-histogram-chart"),
            newSection = document.createElement("section");

        // Create section to be inserted in page
        newSection.className = "section ratings-external";
        newSection.setAttribute("style", "margin-top: 20px;");

        // Create elements for section
        for (var ratingSite in ratings) {
            var newElt = document.createElement("p"),
                newInnerElt = document.createElement("a");
            
            newElt.className = "rating-green";
            newElt.setAttribute("style", "color: #678; margin-bottom: 0.5em;");
            newElt.innerHTML = ratingSite;
            
            newInnerElt.className = "tooltip rating";
            newInnerElt.setAttribute("style",
                "position: absolute; right: 0; cursor: pointer");
            
            newElt.appendChild(newInnerElt);
            newSection.appendChild(newElt);
        }

        // Insert section in page
        var parentNode = ratingsElt.parentNode,
            nextNode = ratingsElt.nextSibling;
        parentNode.insertBefore(newSection, nextNode);
        
        // Hide section
        document.querySelector("section.ratings-external")
            .style.display = "none";

        // Get data to fill section and show it
        getRatings(ratings, showRatings, function () {
            document.querySelector("section.ratings-external")
                .style.display = "block";
        });
    }

    function getRatings(ratings, callback1, callback2) {
        var imdbUrl = document.querySelector("section.col-main p.text-link a")
                .getAttribute("href");

        // Get external page
        GM_xmlhttpRequest({
            method: "GET",
            url: imdbUrl,
            onload: function(response) {
                // Parse DOM of external page
                var res = response.responseText,
                    parser = new DOMParser(),
                    dom = parser.parseFromString(res, "text/html");

                // Get ratings from page
                ratings["IMDb"] = dom
                    .querySelector("#overview-top .star-box-giga-star")
                    .innerHTML;
                ratings["Metacritic"] = dom
                    .querySelector("#overview-top .star-box-details")
                    .children[3].innerHTML.replace(/\/100/, "") / 10;

                callback1(ratings, callback2);
            }
        });
    }

    function showRatings(ratings, callback) {
        // Fill section with actual data
        var i = 0;
        for (var ratingSite in ratings) {
            var ratingVal = +ratings[ratingSite],           // One-to-ten scale
                ratingStars = +(ratingVal / 2).toFixed(1);  // Five-star scale
            
            var elt = document.querySelector("section.ratings-external")
                .children[i].children[0];
                        
            elt.classList.add("rated-" + Math.round(ratingVal));
            elt.setAttribute("title",
                ratingStars + " stars (" + ratingVal + "/10)");

            i++;
        }
        
        callback();
    }

    buildRatingsDisplay();
}());