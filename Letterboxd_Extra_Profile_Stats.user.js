// ==UserScript==
// @name        Letterboxd Extra Profile Stats
// @namespace   https://github.com/rcalderong/userscripts
// @description Adds average number of films watched per month and per week to profile pages
// @copyright   2014, Ramón Calderón (http://rcalderon.es)
// @homepageURL https://github.com/rcalderong/userscripts
// @supportURL  https://github.com/rcalderong/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/rcalderong/userscripts/master/Letterboxd_Extra_Profile_Stats.user.js
// @icon        https://raw.githubusercontent.com/rcalderong/userscripts/master/img/letterboxd_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.3
// @include     /^http:\/\/(www.)?letterboxd.com\/[\w]+\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/activity\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/films\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/lists\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/people\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/settings\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/invitations\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/about\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/pro\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/welcome\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/legal\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/api\/$/
// @exclude     /^http:\/\/(www.)?letterboxd.com\/contact\/$/
// @grant       none
// ==/UserScript==

(function () {
    var diaryUrl,   // URL of the user's film diary
        filmsMonth, // Average number of films watched per month
        filmsWeek,  // Average number of films watched per week
        filmsYear,  // Number of films watched this year
        statsElt;   // Page element that contains user statistics

    // Get data from page
    statsElt = document.querySelector("ul.stats");
    diaryUrl = statsElt.children[1].children[0].getAttribute("href");
    filmsYear = statsElt.children[1].children[0].children[0].textContent;

    // Calculate averages
    filmsMonth = +(filmsYear / (new Date().getMonth() + 1)).toFixed(1);
    filmsWeek = +((filmsMonth / 30) * 7).toFixed(1);

    // Remove zero after decimal point, if present
    [filmsMonth, filmsWeek].map(function (n) {
        return (n === parseInt(n, 10)) ? parseInt(n, 10) : n;
    });

    // Insert calculated averages in page
    [filmsWeek, filmsMonth].forEach(function (filmsAvg) {
        var infoElt = document.getElementsByClassName("profile-person-info")[0],
            linkElt = document.createElement("a"),
            newElt = document.createElement("li"),
            numberElt = document.createElement("strong"),
            textElt = document.createElement("span");
        
        linkElt.setAttribute("href", diaryUrl);
        numberElt.textContent = filmsAvg;
        textElt.textContent = (filmsAvg === filmsWeek) ? "Per week" : "Per month";

        linkElt.appendChild(numberElt);
        linkElt.appendChild(textElt);
        newElt.appendChild(linkElt);
        
        statsElt.insertBefore(newElt, statsElt.children[2]);
        infoElt.style.width = infoElt.style.maxWidth =
            infoElt.offsetWidth - newElt.offsetWidth + "px";
    });
}());