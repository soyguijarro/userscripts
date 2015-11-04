// ==UserScript==
// @name        Flow Subscription Banner Remover
// @namespace   https://github.com/soyguijarro/userscripts
// @description Removes subscription banner from the top of the page 
// @copyright   2015, Ramón Guijarro (http://soyguijarro.com)
// @homepageURL https://github.com/soyguijarro/userscripts
// @supportURL  https://github.com/soyguijarro/userscripts/issues
// @updateURL   https://raw.githubusercontent.com/soyguijarro/userscripts/master/Flow_Subscription_Banner_Remover.user.js
// @icon        https://raw.githubusercontent.com/soyguijarro/userscripts/master/img/flow_icon.png
// @license     GPLv3; http://www.gnu.org/licenses/gpl.html
// @version     1.0
// @include     https://app.getflow.com/*
// @grant       none
// ==/UserScript==

window.addEventListener('load', function() {
  var alertElt = document.getElementsByClassName('app-alert')[0];
  alertElt.style.display = 'none';
}, false);