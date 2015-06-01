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
// @version     1.1
// @include     /^http:\/\/(www.)?letterboxd.com\/film\/[\w|\-]+\/$/
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    var sites = ["IMDb", "Metacritic", "Rotten Tomatoes"],
        loadingCounter = sites.length;

    function decrLoadingCounter() {
        loadingCounter--;

        if (loadingCounter < 1) {
            var parentNode = document.querySelector("section.ratings-external"),
                childNode = parentNode.querySelector("div.spinner");

            parentNode.removeChild(childNode);
        }
    }
    
    function buildRatingsDisplay() {
        var ratingsElt = document.querySelector("section.ratings-histogram-chart"),
            parentNode = ratingsElt.parentNode,
            nextNode = ratingsElt.nextSibling,
            newSection = document.createElement("section");
        
        // Create section to be inserted in page
        newSection.className = "section ratings-external";
        newSection.style.marginTop = "20px";

        // Create elements for section
        for (var i = 0; i < sites.length; i++) {
            var newElt = document.createElement("a"),
                newInnerElt = document.createElement("span");
            
            newElt.textContent = sites[i];
            newElt.className = "rating-green";
            newElt.style.transition = "opacity 0.2s ease";
            newElt.style.fontSize = "12px";
            newElt.style.lineHeight = "1.5";
            newElt.style.marginBottom = "0.5em";
            newElt.style.opacity = "0";
            newElt.style.display = "none";
            
            newInnerElt.className = "tooltip";
            newInnerElt.style.right = "0";
            newInnerElt.style.position = "absolute";
            
            newElt.appendChild(newInnerElt);
            newSection.appendChild(newElt);
        }

        // Create loading indicator (spinner) for section
        var spinnerUrl =
            "http://memento.cf1.letterboxd.com/static/img/spinners/spinner-12-2C3641.c95c11d5.gif";

        var newLoadingElt = document.createElement("div");
        newLoadingElt.className = "spinner";
        newLoadingElt.style.borderRadius = "3px";
        newLoadingElt.style.backgroundColor = "#242D35";
        newLoadingElt.style.border = "1px solid #333B42";
        newLoadingElt.style.padding = "7px 0 8px";
        newLoadingElt.style.width = "100%";
        newLoadingElt.style.margin = "1em auto 0 auto";

        var newInnerLoadingElt = document.createElement("div");
        newInnerLoadingElt.className = "spinner-body";
        newInnerLoadingElt.style.width = newInnerLoadingElt.style.height = "12px";
        newInnerLoadingElt.style.margin = "auto";
        newInnerLoadingElt.style.backgroundImage = "url('" + spinnerUrl + "')";

        newLoadingElt.appendChild(newInnerLoadingElt);
        newSection.appendChild(newLoadingElt);

        // Insert section in page
        parentNode.insertBefore(newSection, nextNode);

        // Fill section with data
        getRatings();
    }

    function getRatings() {
        var filmTitle = document.
                querySelector("#featured-film-header h1.film-title").textContent,
            filmYear = parseInt(document.
                querySelector("#featured-film-header p small a").textContent, 10),
            imdbUrl = document.querySelector("section.col-main p.text-link a").
                getAttribute("href"),
            rottenUrl = encodeURI("http://www.rottentomatoes.com/search/?search=" +
                filmTitle);
        
        getImdbAndMetaRatings = GM_xmlhttpRequest({
            method: "GET",
            url: imdbUrl,
            onload: function (response) {
                var res = response.responseText,
                    parser = new DOMParser(),
                    dom = parser.parseFromString(res, "text/html");

                imdbUrl = response.finalUrl;

                var imdbRatingElt = dom.
                        querySelector("#overview-top .star-box-giga-star"),
                    metaRatingMatch = dom.
                        querySelector("#overview-top .star-box-details").
                        textContent.match(/Metascore:  \d+/);
                
                // Check for rating in the page
                if (imdbRatingElt) {
                    var imdbRating = parseFloat(imdbRatingElt.textContent);
                    showRatingElt("IMDb", imdbUrl, imdbRating);
                } else {
                    removeRatingElt("IMDb");
                }

                // Check for rating in the page
                if (metaRatingMatch) {
                    var metaRating = metaRatingMatch[0].match(/\d+/) / 10,
                        metaUrl = imdbUrl + "criticreviews";

                        showRatingElt("Metacritic", metaUrl, metaRating);    
                } else {
                    removeRatingElt("Metacritic");
                }
            }
        });

        getRottenRatings = GM_xmlhttpRequest({
            method: "GET",
            url: rottenUrl,
            onload: function (response) {
                var res = response.responseText,
                    parser = new DOMParser(),
                    dom = parser.parseFromString(res, "text/html");
                
                function getUrlOfMatchingResult(refYear, resultsElt) {
                    var yearElts = resultsElt.
                        querySelectorAll("div.media-body span");
                    
                    for (var i = 0; i < yearElts.length; i++) {
                        var comparisonYear = parseInt(yearElts[i].textContent.
                               replace(/\(/, ""), 10),
                            yearDiff = Math.abs(refYear - comparisonYear);

                        if (yearDiff < 2) {
                            var relPath = yearElts[i].previousSibling.
                                    getAttribute("href"),
                                absPath = "http://www.rottentomatoes.com" +
                                    relPath;

                            return absPath;
                        }
                    }
                    return null;
                }

                function showRottenRating(dom) {
                    var ratingElt = dom.querySelector("#scoreStats");
                    
                    // Check for rating in the page
                    if (ratingElt) {
                        var ratingMatch = ratingElt.textContent.
                            match(/Average Rating:  [0-9.]+/);
                        
                        if (ratingMatch) {
                            var rottenRating = parseFloat(ratingMatch[0].
                                match(/[0-9.]+/));
                            showRatingElt("Rotten Tomatoes",
                                rottenUrl, rottenRating);
                        } else {
                            removeRatingElt("Rotten Tomatoes");    
                        }
                    } else {
                        removeRatingElt("Rotten Tomatoes");
                    }
                }

                var filmPageElt = dom.querySelector("#scoreStats"),
                    searchPageElt = dom.querySelector("#all_tab");

                if (filmPageElt) {  // Redirected to film page
                    rottenUrl = response.finalUrl;
                    showRottenRating(dom);
                } else if (searchPageElt) { // Redirected to search results page
                    var filmResultsElt = dom.querySelector("ul#movie_results_ul"),
                        tvResultsElt = dom.querySelector("ul#tv_results_ul"),
                        allResultsElt = dom.createElement("div");
                    
                    // Look for a result matching the film year                    
                    [filmResultsElt, tvResultsElt].forEach(function (elt) {
                        if (elt) allResultsElt.appendChild(elt);
                    });
                    
                    rottenUrl = getUrlOfMatchingResult(filmYear, allResultsElt);
                    
                    // Get film page for the match
                    if (rottenUrl) {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: rottenUrl,
                            onload: function (response) {
                                var res = response.responseText,
                                    parser = new DOMParser(),
                                    dom = parser.parseFromString(res, "text/html");
                                
                                rottenUrl = response.finalUrl;
                                showRottenRating(dom);
                            }
                        });
                    } else {
                        removeRatingElt("Rotten Tomatoes");    
                    }
                } else {
                    removeRatingElt("Rotten Tomatoes");
                }
            }
        });
        
        getImdbAndMetaRatings();
        getRottenRatings();
    }

    function showRatingElt(siteName, siteUrl, rating) {
        if (rating !== "" && rating !== 0 && !isNaN(rating)) {
            var index = sites.indexOf(siteName),
                ratingInStars = +(rating / 2).toFixed(1),   // Five-star scale
                elt = document.querySelector("section.ratings-external").
                    children[index],
                innerElt = elt.children[0];
                      
            innerElt.classList.add("rating");
            innerElt.classList.add("rated-" + Math.round(rating));
            innerElt.setAttribute("title",
                ratingInStars + " stars (" + +rating + "/10)");

            elt.setAttribute("href", siteUrl);
            elt.style.display = "block";

            setTimeout(function () {
                elt.style.opacity = "1";
            }, 0);

            decrLoadingCounter();
        } else {
            removeRatingElt(siteName);
        }
    }

    function removeRatingElt(siteName) {
        var index = sites.indexOf(siteName),
            parentNode = document.querySelector("section.ratings-external"),
            childNode = parentNode.children[index];

        parentNode.removeChild(childNode);
        sites.splice(index, 1);

        decrLoadingCounter();
    }

    buildRatingsDisplay();
}());