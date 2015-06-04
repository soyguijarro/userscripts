// ==UserScript==
// @name        Letterboxd Bio Modifier
// @namespace   https://github.com/rcalderong/userscripts
// @description Adds visual bio summary and Wikipedia link to actors and directors pages
// @copyright   2015, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_Bio_Modifier.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.0
// @include     http://letterboxd.com/director/*
// @include     http://letterboxd.com/actor/*
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    var sidebarElt = document.querySelector("aside.sidebar"),
        bioElt = sidebarElt.getElementsByClassName("tmdb-person-bio")[0],
        tmdbId = bioElt.getAttribute("data-tmdb-id"),
        tmdbBaseUrl = "http://themoviedb.org/person/",
        tmdbUrl = tmdbBaseUrl + tmdbId;

    function showBioSummary(response) {
        var res = response.responseText,
            parser = new DOMParser(),
            dom = parser.parseFromString(res, "text/html"),
            tmdbBirthplaceElt = dom.getElementById("place_of_birth"),
            tmdbBirthdayElt = dom.getElementById("birthday"),
            tmdbDeathdayElt = dom.getElementById("deathday"),
            creditsElt = dom.querySelector("div#leftCol p"),
            creditsMatch = creditsElt.textContent.match(/Known Credits: \d+/),
            gotRelevantData = isActualData(tmdbBirthplaceElt) ||
                isActualData(tmdbBirthdayElt),
            bioSummaryElt = document.createElement("section"),
            bioSummaryElts,
            bioInnerElt,
            creditsMatch;

        function addStyle() {
            var headElt = document.getElementsByTagName("head")[0],
                styleElt = document.createElement("style"),
                cssRules = "section.panel-text.bio-summary {\
                                border-bottom: 1px solid #456;\
                                margin = 15px 0;\
                            }\
                            section.panel-text.bio-summary p {\
                                padding-left: 25px;\
                                display: block;\
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

        function getFormattedDate(date) {
            var monthNum = date.getMonth(),
                dayNum = date.getDate(),
                yearNum = date.getFullYear(),
                monthNames = ["Jan", "Feb", "Mar", "Apr",
                    "May", "Jun", "Jul", "Aug", "Sep", "Oct",
                    "Nov", "Dec"];

            return monthNames[monthNum] + " " + dayNum + ", " + yearNum;
        }

        function isActualData(elt) {
            var data = elt.textContent,
                exp = /^-$/;

            return !(exp.test(data));
        }

        function showBirthplace() {
            var birthplace = tmdbBirthplaceElt.textContent,
                birthplaceElt = document.createElement("p"),
                birthplaceIconElt = document.createElement("span");

            // Fill element with data and apply styles
            birthplaceElt.classList.add("icon-location");
            birthplaceElt.textContent = birthplace.replace(/ - /g, ", ");
            birthplaceIconElt.style.marginLeft = "2px";

            // Insert element in section
            birthplaceElt.appendChild(birthplaceIconElt);
            bioSummaryElt.appendChild(birthplaceElt);
        }

        function showBornDeathDate() {
            var birthday = new Date(tmdbBirthdayElt.firstChild.textContent),
                dateElt = document.createElement("p"),
                dateIconElt = document.createElement("span"),
                msPerYear = 1000 * 60 * 60 * 24 * 365,
                refDate,
                date,
                age;

            // Fill element with data and apply styles
            if (tmdbDeathdayElt) {  // Person is dead
                // Use death date as reference to calculate age
                refDate = new Date(tmdbDeathdayElt.firstChild.textContent);
                date = refDate; // Show death date

                dateElt.classList.add("icon-hidden");
                dateIconElt.style.marginLeft = "3px";
            } else {    // Person is alive
                // Use today as reference to calculate age
                refDate = new Date();
                date = birthday;    // Show birthday

                dateElt.classList.add("icon-people");
            }
            age = Math.floor((refDate - birthday.getTime()) / msPerYear);
            dateElt.textContent = getFormattedDate(date) +
                " (age" + ((tmdbDeathdayElt) ? "d" : "") + " " + age + ")";

            // Insert element in section
            dateElt.appendChild(dateIconElt);
            bioSummaryElt.appendChild(dateElt);
        }

        function showNumCredits() {
            var numCredits = creditsMatch[0].match(/\d+/),
                creditsElt = document.createElement("p"),
                creditsIconElt = document.createElement("span");

            // Fill element with data and apply styles
            creditsElt.classList.add("icon-list-all");
            creditsElt.textContent = numCredits + " known credits";
            creditsIconElt.style.backgroundPosition = "-740px -110px";

            // Insert element in section
            creditsElt.appendChild(creditsIconElt);
            bioSummaryElt.appendChild(creditsElt);
        }

        // Set up section to be inserted in page
        bioSummaryElt.className = "section panel-text bio-summary";

        // Fill section with available data
        if (gotRelevantData) {
            if (isActualData(tmdbBirthplaceElt)) {
                showBirthplace();    
            }
            if (isActualData(tmdbBirthdayElt)) {
                showBornDeathDate();    
            }
            if (creditsMatch) {
                showNumCredits();    
            }

            showWikiLink();
        } else {
            return; // Abort if no relevant data at all is available
        }

        // Apply common styles to section elements
        bioSummaryElts = bioSummaryElt.children;
        for (var i = 0; i < bioSummaryElts.length; i++) {
            bioSummaryElts[i].classList.add("has-icon")
            bioSummaryElts[i].classList.add("icon-16");
            bioSummaryElts[i].children[0].className = "icon";
        }

        // Insert section in page
        bioInnerElt = bioElt.querySelector("section.panel-text.condensed") ||
            bioElt.querySelector("section.panel-text");

        if (bioInnerElt) {  // Already existing bio section
            bioInnerElt.insertBefore(bioSummaryElt,
                bioInnerElt.firstChild.nextSibling);    
        } else {    // No bio section, add missing header
            var bioHeaderElt = document.createElement("h2");
            bioHeaderElt.className = "section-heading";
            bioHeaderElt.textContent = "Bio";

            bioElt.appendChild(bioHeaderElt);
            bioElt.appendChild(bioSummaryElt);
        }
        addStyle();
    }

    function showWikiLink() {
        var linksElt = document.querySelector("section.bio-link"),
            headerElt = document.querySelector("header.page-header"),
            personNameElt = headerElt.querySelector("h1.inline-heading.prettify em"),
            wikiLinkElt = document.createElement("li"),
            wikiLinkInnerElt = document.createElement("a"),
            personName = personNameElt.textContent,
            wikiBaseUrl = "https://en.wikipedia.org/wiki/",
            wikiUrl = wikiBaseUrl + personName,
            linksInnerElt;

        // Fill element with data and apply styles
        wikiLinkInnerElt.className = "box-link";
        wikiLinkInnerElt.setAttribute("href", wikiUrl);
        wikiLinkInnerElt.textContent = "Search on Wikipedia";
        wikiLinkElt.appendChild(wikiLinkInnerElt);

        // Insert section in page
        if (linksElt) { // Already existing link section
            linksInnerElt = linksElt.getElementsByTagName("ul")[0];
            linksInnerElt.insertBefore(wikiLinkElt, linksInnerElt.firstChild);
        } else {    // No link section, create first
            linksElt = document.createElement("section");
            linksInnerElt = document.createElement("ul");
            linksElt.className = "section bio-link";
            linksInnerElt.className = "box-link-list box-links";

            linksInnerElt.appendChild(wikiLinkElt);
            linksElt.appendChild(linksInnerElt);
            sidebarElt.appendChild(linksElt);
        }
    }

    GM_xmlhttpRequest({
        method: "GET",
        url: tmdbUrl,
        onload: showBioSummary
    });
}());