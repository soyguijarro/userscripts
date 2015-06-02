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
// @version     1.4
// @include     /^http:\/\/(www.)?letterboxd.com\/film\/[\w|\-]+\/$/
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

(function () {
    var externalSites = ["IMDb", "Metacritic", "Rotten Tomatoes"];
    
    function createRatingsSection(callback) {
        var sidebarElt = document.querySelector("aside.sidebar"),
            sidebarLastElt = sidebarElt.lastElementChild,
            ratingsSectionElt = document.createElement("section"),
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
                                display: block;\
                                font-size: 12px;\
                                line-height: 1.5;\
                                margin-bottom: 0.5em;\
                            }\
                            section.ratings-external span {\
                                position: absolute;\
                                right: 0;\
                                color: #6C3;\
                            }\
                            section.ratings-external span.spinner {\
                                background: url('" + getSpinnerImageUrl() + "');\
                                height: 12px;\
                                width: 12px;\
                                margin: 3px 0;\
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
            ratingInnerElt.className = "tooltip spinner";
            ratingElt.style.cursor = "default";

            ratingElt.appendChild(ratingInnerElt);
            ratingsSectionElt.appendChild(ratingElt);
        }

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
            rottenSuffixUrl = "#results_movies_tab"
            rottenUrl = rottenBaseUrl + encodeURIComponent(filmTitle) +
                rottenSuffixUrl;

        function updateRatingsSection(rating, siteName, siteUrl) {
            var index = externalSites.indexOf(siteName),
                ratingsSectionElt = document.querySelector("section.ratings-external"),
                ratingElts = ratingsSectionElt.getElementsByTagName("a"),
                ratingElt = ratingElts[index],
                ratingInnerElt = ratingElt.children[0],
                ratingInStars = +(rating / 2).toFixed(1);   // Five-star scale

            // Remove loading indicator (spinner)
            ratingInnerElt.classList.remove("spinner");

            // Fill rating element with data
            if (rating && rating !== "" && rating !== 0 && !isNaN(rating)) {
                ratingInnerElt.classList.add("rating");
                ratingInnerElt.classList.add("rated-" + Math.round(rating));
                ratingInnerElt.setAttribute("title", ratingInStars +
                    " stars (" + (+rating) + "/10)");
                ratingElt.setAttribute("href", siteUrl);
                ratingElt.style.cursor = "pointer";
            } else {
                ratingInnerElt.textContent = "N/A";
            }
        }

        function getFinalUrlAbsPath(response, baseUrl) {
            var path = response.finalUrl;

            // Remove suffix if present
            if (path.match(rottenSuffixUrl)) {
                path = path.replace(rottenSuffixUrl, "");
            }

            if (path.match(/^http/)) {  // Absolute path already
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
                        updateRatingsSection(null, "Metacritic");
                    }
                } else {
                    updateRatingsSection(null, "Metacritic");
                }    
            }

            if (ratingsElt) {
                getIMDbRating();
                getMetaRating();
            } else {
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
                    resultYearElt,
                    resultYear,
                    yearDiff,
                    rottenRating;
                
                if (ratingElt) {
                    ratingMatch = ratingElt.textContent.
                        match(/Average Rating:  [0-9.]+/);
                    
                    if (ratingMatch) {
                        // Check year to confirm valid result
                        resultYearElt = dom.
                            querySelector("h1.movie_title span.subtle").textContent;
                        resultYear = parseInt(resultYearElt.replace(/\(/, ""), 10);
                        yearDiff = Math.abs(filmYear - resultYear);

                        if (yearDiff <= 2) {
                            rottenRating = parseFloat(ratingMatch[0].
                                match(/[0-9.]+/));
                            rottenUrl = getFinalUrlAbsPath(response,
                                "http://www.rottentomatoes.com");
                            updateRatingsSection(rottenRating, "Rotten Tomatoes",
                                rottenUrl);
                        } else {
                            updateRatingsSection(null, "Rotten Tomatoes");
                        }
                    } else {
                        updateRatingsSection(null, "Rotten Tomatoes");
                    }
                } else {
                    updateRatingsSection(null, "Rotten Tomatoes");
                }
            }

            function getFilmPageUrlFromSearchPage(response) {
                var res = response.responseText,
                    dom = parser.parseFromString(res, "text/html"),
                    resultsElts = dom.
                        querySelectorAll("ul#movie_results_ul li div.media-body"),
                    baseUrl = "http://www.rottentomatoes.com",
                    resultYearElt,
                    resultYear,
                    yearDiff,
                    urlElt,
                    url;
                    
                // Pick result that matches year (exactly at first; if not, roughly)
                for (var i = 0; i <= 2; i++) {
                    for (var j = 0; j < resultsElts.length; j++) {
                        resultYearElt = resultsElts[j].
                            getElementsByTagName("span")[0].textContent;
                        resultYear = parseInt(resultYearElt.replace(/\(/, ""), 10);
                        yearDiff = Math.abs(filmYear - resultYear);

                        if (yearDiff <= i) {
                            urlElt = resultsElts[j].getElementsByTagName("a")[0];
                            url = urlElt.getAttribute("href");
                            return baseUrl + url;
                        }
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
                    updateRatingsSection(null, "Rotten Tomatoes");
                }
            } else {
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