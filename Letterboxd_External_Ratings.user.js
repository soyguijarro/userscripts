// ==UserScript==
// @name        Letterboxd External Ratings
// @namespace   https://github.com/rcalderong/userscripts
// @description Adds ratings of film from external sites to film pages
// @copyright   2015, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_External_Ratings.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.5
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
            var spinnersObj = unsafeWindow.globals.spinners,
                propExp = /spinner_12/; // Regex for sought property

            for (var prop in spinnersObj) {
                if (propExp.test(prop)) {
                    return spinnersObj[prop];
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
            rottenSuffixUrl = "#results_movies_tab",
            rottenUrl = rottenBaseUrl + getNormalizedUrlComp(filmTitle) +
                rottenSuffixUrl;

        function getNormalizedUrlComp(str) {
            var combining = /[\u0300-\u036F]/g,
                isNormalizeAvailable =
                    (typeof String.prototype.normalize == "function"),
                isEscapeAvailable = (typeof escape == "function"),
                normalizedStr;

            if (isNormalizeAvailable) {
                normalizedStr = str.normalize('NFKD').replace(combining, '');
                return encodeURIComponent(normalizedStr);
            } else if (isEscapeAvailable) {
                return escape(str);
            } else {
                return encodeURIComponent(str);
            }
        }

        function updateRatingsSection(rating, siteName, siteUrl, tomatometer) {
            var index = externalSites.indexOf(siteName),
                ratingsSectionElt = document.querySelector("section.ratings-external"),
                ratingElts = ratingsSectionElt.getElementsByTagName("a"),
                ratingElt = ratingElts[index],
                ratingInnerElt = ratingElt.children[0],
                ratingInStars = +(rating / 2).toFixed(1),   // Five-star scale
                tomatometerString;

            // Remove loading indicator (spinner)
            ratingInnerElt.classList.remove("spinner");

            // Fill rating element with data
            if (rating && rating !== "" && rating !== 0 && !isNaN(rating)) {
                if (tomatometer) {
                    tomatometerString = " – " + tomatometer + "%";
                } else {
                    tomatometerString = "";
                }
                ratingInnerElt.classList.add("rating");
                ratingInnerElt.classList.add("rated-" + Math.round(rating));
                ratingInnerElt.setAttribute("title", ratingInStars +
                    " stars (" + (+rating) + "/10)" + tomatometerString);
                ratingElt.setAttribute("href", siteUrl);
                ratingElt.style.cursor = "pointer";
            } else {
                ratingInnerElt.textContent = "N/A";
            }
        }

        function getFinalUrlAbsPath(response, baseUrl) {
            var path = response.finalUrl,
                suffixExp = new RegExp(rottenSuffixUrl),
                absPathExp = new RegExp(/^http/);

            // Remove suffix if present
            if (suffixExp.test(path)) {
                path = path.replace(rottenSuffixUrl, "");
            }

            if (absPathExp.test(path)) {    // Absolute path already
                return path;
            } else {                        // Relative path
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
                    tomatometerElt = dom.getElementById("tomato_meter_link"),
                    ratingMatch,
                    resultYearElt,
                    resultYear,
                    yearDiff,
                    rottenRating,
                    rottenTomatometer;
                
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
                            rottenTomatometer = (tomatometerElt) ?
                                parseInt(tomatometerElt.textContent, 10) : null;                            
                            rottenUrl = getFinalUrlAbsPath(response,
                                "http://www.rottentomatoes.com");
                            updateRatingsSection(rottenRating, "Rotten Tomatoes",
                                rottenUrl, rottenTomatometer);
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