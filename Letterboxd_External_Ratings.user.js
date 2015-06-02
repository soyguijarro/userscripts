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
// @version     1.3
// @include     /^http:\/\/(www.)?letterboxd.com\/film\/[\w|\-]+\/$/
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

(function () {
    var externalSites = ["IMDb", "Metacritic", "Rotten Tomatoes"],
        loadingCounter = externalSites.length;
    
    function createRatingsSection(callback) {
        var sidebarElt = document.querySelector("aside.sidebar"),
            sidebarLastElt = sidebarElt.lastElementChild,
            ratingsSectionElt = document.createElement("section"),
            spinnerElt = document.createElement("div"),
            spinnerInnerElt = document.createElement("div"),
            ratingElt,
            ratingInnerElt;

        function getSpinnerImageUrl() {
            for (var id in unsafeWindow.globals.spinners) {
                if (id.match(/spinner_12/)) {
                    return unsafeWindow.globals.spinners[id];
                }
            }
            return null;
        }

        function addStyle() {
            var headElt = document.getElementsByTagName("head")[0],
                styleElt = document.createElement("style"),
                cssRules = "section.ratings-external {\
                                margin-top: 20px;\
                            }\
                            section.ratings-external a {\
                                font-size: 12px;\
                                line-height: 1.5;\
                                margin-bottom: 0.5em;\
                            }\
                            section.ratings-external span {\
                                position: absolute;\
                                right: 0;\
                            }\
                            section.ratings-external div.spinner {\
                                background-color: #242D35;\
                                border: 1px solid #333B42;\
                                border-radius: 3px;\
                                padding: 7px 0 8px;\
                                width: 100%;\
                                margin: 1em auto 0 auto;\
                            }\
                            section.ratings-external div.spinner-body {\
                                background: url('" + getSpinnerImageUrl() + "');\
                                height: 12px;\
                                width: 12px;\
                                margin: auto;\
                            }";

            try {
                styleElt.type = "text/css";
                styleElt.innerHTML = cssRules;
                headElt.appendChild(styleElt);
            } catch (e) {
                if (!document.styleSheets.length) {
                    document.createStyleSheet();
                }
                document.styleSheets[0].cssText += cssRules;
            }
        }
        
        // Set up section to be inserted in page
        ratingsSectionElt.className = "section ratings-external";

        // Set up section elements that will contain ratings
        for (var i = 0; i < externalSites.length; i++) {
            ratingElt = document.createElement("a");
            ratingInnerElt = document.createElement("span");
            
            ratingElt.textContent = externalSites[i];
            ratingElt.className = "rating-green";
            ratingInnerElt.className = "tooltip";
            ratingElt.style.display = "none";
            
            ratingElt.appendChild(ratingInnerElt);
            ratingsSectionElt.appendChild(ratingElt);
        }

        // Set up loading indicator (spinner)
        spinnerElt.className = "spinner";
        spinnerInnerElt.className = "spinner-body";

        spinnerElt.appendChild(spinnerInnerElt);
        ratingsSectionElt.appendChild(spinnerElt);

        // Insert section in page
        sidebarElt.insertBefore(ratingsSectionElt, sidebarLastElt);
        addStyle();

        callback();
    }

    function fillRatingsSection() {
        var filmDataElt = document.querySelector("section.posters div.film-poster"),
            filmTitle = filmDataElt.getAttribute("data-film-name"),
            filmYear = parseInt(filmDataElt.getAttribute("data-film-release-year"), 10),
            imdbUrlElt = document.querySelector("section.col-main p.text-link a"),
            imdbUrl = imdbUrlElt.getAttribute("href"),
            rottenBaseUrl = "http://www.rottentomatoes.com/search/?search=",
            rottenUrl = rottenBaseUrl + encodeURIComponent(filmTitle);

        function updateRatingsSection(rating, siteName, siteUrl) {
            var index = externalSites.indexOf(siteName),
                ratingsSectionElt = document.querySelector("section.ratings-external"),
                spinnerElt = ratingsSectionElt.querySelector("div.spinner"),
                ratingElts = ratingsSectionElt.getElementsByTagName("a"),
                ratingElt = ratingElts[index],
                ratingInnerElt = ratingElt.children[0],
                ratingInStars = +(rating / 2).toFixed(1);   // Five-star scale

            if (rating && rating !== "" && rating !== 0 && !isNaN(rating)) {
                // Fill rating element with data
                ratingInnerElt.classList.add("rating");
                ratingInnerElt.classList.add("rated-" + Math.round(rating));
                ratingInnerElt.setAttribute("title", ratingInStars +
                    " stars (" + (+rating) + "/10)");
                ratingElt.setAttribute("href", siteUrl);
            } else {
                // Remove rating element
                ratingsSectionElt.removeChild(ratingElt);
                externalSites.splice(index, 1);
            }

            loadingCounter--;
            if (loadingCounter < 1) {
                // Remove loading indicator (spinner)
                ratingsSectionElt.removeChild(spinnerElt);
                // Show ratings
                for (var i = 0; i < ratingElts.length; i++) {
                    ratingElts[i].style.display = "block";
                }
            }
        }

        function getFinalUrlAbsPath(response, baseUrl) {
            var path = response.finalUrl;

            if (path.match(/^http/)) {  // Absolute path
                return path;
            } else {                    // Relative path
                return baseUrl + path;
            }
        }

        function getIMDbAndMetaRatings(response) {
            var res = response.responseText,
                parser = new DOMParser(),
                dom = parser.parseFromString(res, "text/html"),
                ratingsElt = dom.getElementById("overview-top");
            
            imdbUrl = getFinalUrlAbsPath(response, "http://www.imdb.com");

            function getIMDbRating() {
                var imdbRating,
                    imdbRatingElt = ratingsElt.
                        getElementsByClassName("star-box-giga-star")[0];

                if (imdbRatingElt) {
                    imdbRating = parseFloat(imdbRatingElt.textContent);
                    updateRatingsSection(imdbRating, "IMDb", imdbUrl);
                } else {
                    // No rating found
                    updateRatingsSection(null, "IMDb");
                }
            }

            function getMetaRating() {
                var metaRatingMatch,
                    metaUrl,
                    metaRatingElt = ratingsElt.
                        getElementsByClassName("star-box-details")[0];

                if (metaRatingElt) {
                    metaRatingMatch = metaRatingElt.textContent.
                        match(/Metascore:  \d+/);

                    if (metaRatingMatch) {
                        metaRating = metaRatingMatch[0].match(/\d+/) / 10;
                        metaUrl = imdbUrl + "criticreviews";
                        updateRatingsSection(metaRating, "Metacritic", metaUrl);
                    } else {
                        // No rating found
                        updateRatingsSection(null, "Metacritic");
                    }
                } else {
                    // No rating found
                    updateRatingsSection(null, "Metacritic");
                }    
            }

            if (ratingsElt) {
                getIMDbRating();
                getMetaRating();
            } else {
                // No ratings found
                updateRatingsSection(null, "IMDb");
                updateRatingsSection(null, "Metacritic");
            }
        }

        function getRottenRatings(response) {
            var res = response.responseText,
                parser = new DOMParser(),
                dom = parser.parseFromString(res, "text/html"),
                filmPageElt = dom.getElementById("all-critics-numbers"),
                searchPageElt = dom.getElementById("all_tab");

            function getRatingFromFilmPage(response) {
                var res = response.responseText,
                    dom = parser.parseFromString(res, "text/html"),
                    ratingElt = dom.getElementById("scoreStats"),
                    ratingMatch,
                    rottenRating;
                
                if (ratingElt) {
                    ratingMatch = ratingElt.textContent.
                        match(/Average Rating:  [0-9.]+/);
                    
                    if (ratingMatch) {
                        rottenRating = parseFloat(ratingMatch[0].
                            match(/[0-9.]+/));
                        rottenUrl = getFinalUrlAbsPath(response,
                            "http://www.rottentomatoes.com");
                        updateRatingsSection(rottenRating, "Rotten Tomatoes",
                            rottenUrl);
                    } else {
                        // No rating found
                        updateRatingsSection(null, "Rotten Tomatoes");
                    }
                } else {
                    // No rating found
                    updateRatingsSection(null, "Rotten Tomatoes");
                }
            }

            function getFilmPageUrlFromSearchPage(response) {
                var res = response.responseText,
                    dom = parser.parseFromString(res, "text/html"),
                    filmResultsElt = dom.querySelector("ul#movie_results_ul"),
                    tvResultsElt = dom.querySelector("ul#tv_results_ul"),
                    allResultsElt = dom.createElement("div"),
                    comparisonYear,
                    yearDiff,
                    relFilmUrl,
                    absFilmUrl;
                
                // Gather all search results from page
                [filmResultsElt, tvResultsElt].forEach(function (elt) {
                    if (elt) {
                        allResultsElt.appendChild(elt);
                    }
                });
                
                // Get years of all search results
                yearElts = allResultsElt.querySelectorAll("div.media-body span");

                // Pick result that roughly matches desired year
                for (var i = 0; i < yearElts.length; i++) {
                    comparisonYear = parseInt(yearElts[i].textContent.
                           replace(/\(/, ""), 10);
                    yearDiff = Math.abs(filmYear - comparisonYear);

                    if (yearDiff < 2) {
                        relFilmUrl = yearElts[i].previousSibling.
                            getAttribute("href");
                        absFilmUrl = "http://www.rottentomatoes.com" + relFilmUrl;
                        return absFilmUrl;
                    }
                }
                return null;    // No matching results
            }

            if (filmPageElt) {          // Redirected to film page
                getRatingFromFilmPage(response);
            } else if (searchPageElt) { // Redirected to search results page
                var filmPageUrl = getFilmPageUrlFromSearchPage(response);

                if (filmPageUrl) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: filmPageUrl,
                        onload: getRatingFromFilmPage
                    });
                } else {
                    // No rating found
                    updateRatingsSection(null, "Rotten Tomatoes");
                }
            } else {
                // No rating found
                updateRatingsSection(null, "Rotten Tomatoes");
            }
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: imdbUrl,
            onload: getIMDbAndMetaRatings
        });

        GM_xmlhttpRequest({
            method: "GET",
            url: rottenUrl,
            onload: getRottenRatings
        });
    }

    createRatingsSection(fillRatingsSection);
}());