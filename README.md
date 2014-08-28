# User scripts for web browsers

This repository hosts a few user scripts I've written. These are little pieces of software that extend or modify the behavior or appearance of certain web pages. They need to be used with a user script manager, which is an add-on or extension for web browsers (check the [installation section](#installation)).


## Features

### Letterboxd Average Rating

![Letterboxd Average Rating in action](img/letterboxd_average_rating_screenshot.gif)

Adds the average rating of the film to [Letterboxd](http://letterboxd.com)'s film pages. It is presented with star icons above the rating histogram. Hovering over reveals the exact number.

### Letterboxd Backdrop Remover

![Letterboxd Backdrop Remover in action](img/letterboxd_backdrop_remover_screenshot.gif)

Removes the backdrop image present at the top of most [Letterboxd](http://letterboxd.com)'s film pages. This allows you to see more information of the film at a glance, reducing the need to scroll.

### Letterboxd Extra Profile Stats

![Letterboxd Extra Profile Stats in action](img/letterboxd_extra_profile_stats_screenshot.gif)

Adds the average number of films watched per month and per week in the current year to the statistics displayed at the top of [Letterboxd](http://letterboxd.com)'s profile pages. Note that although this is the same data displayed in the *Year in Review* page that is only available to Pro members, this script will work in all profile pages, irrespective of the kind of membership.


## Installation

1. If you don't have a user script manager, install one first. For Mozilla Firefox, get [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/). For Google Chrome, [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) is the one you need. For other browsers, check [this page](http://wiki.greasespot.net/Cross-browser_userscripting).

2. You have two options to install the user scripts in this repository:
    1. In this page, click on the filename of the script you want to install (they end in `.user.js`). A new page will load showing its code. Click on the **Raw** button.

    2. Alternatively, go to [my OpenUserJS page](https://openuserjs.org/users/rcalderong/scripts) and click on the script you want to install. A new page will load with the details of the script. Click on the **Install** button.

3. Your user script manager will prompt you to confirm the installation.


## Compatibility

These scripts have been tested with [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) on Mozilla Firefox and [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) on Google Chrome, but they should work with pretty much any user script manager. If you find something not working properly, please [report the issue](https://github.com/rcalderong/userscripts/issues).


## License

These scripts are released under version 3 of the GNU General Public License (GPL v3). The full text of the license is available in the [LICENSE file](LICENSE).