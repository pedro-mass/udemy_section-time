// ==UserScript==
// @name         Udemy - show total section time
// @updateURL    https://openuserjs.org/meta/pedro-mass/My_Script.meta.js
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  For Udemy, adds total time to each section
// @copyright    2017, Pedro Mass (https://github.com/pedro-mass)
// @author       pedro-mass
// @match        *.udemy.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-3.2.0.min.js
// @require      https://greasyfork.org/scripts/5392-waitforkeyelements/code/WaitForKeyElements.js?version=115012
// @run-at       document-idle
// ==/UserScript==

(function() {
  // ----- todo
  // - split up for hours

  var selectors = {
    sectionCard: 'curriculum-navigation-section',
    lectureTime: '.lecture__item__link__time',
    lectureName: '.curriculum-navigation__section__title',
    lectureStatus: '.cur-status'
  };

  // waits for the cards to be loaded
  waitForKeyElements(selectors.sectionCard, run);

  function run() {
    var sections = $(selectors.sectionCard);

    $.each(sections, function(index, section) {
      // get the section title
      var title = $(section).find(selectors.lectureName).text();

      // get the times
      var timeSpans = $(section).find(selectors.lectureTime);
      var timeTexts = convertTimeSpansToTexts(timeSpans);

      // sum the times
      var totalTime = sumTextTimes(timeTexts);

      // prepend to lecture status
      var totalTimeSpan = $(section).find(selectors.lectureStatus).find('.section-totalTime');

      // check to see if we've already added the time to the DOM
      if (totalTimeSpan.length > 0) {
        $(totalTimeSpan[0]).text(totalTime);
      } else {
        // we haven't, so create the element and add it
        $(section).find(selectors.lectureStatus).prepend('<span class="section-totalTime" style="margin-right:1em">'+ totalTime + '</span>');
      }
    });
  }

  function convertTimeSpansToTexts(timeSpans) {
    var timeTexts = [];

    for (var i=0; i<timeSpans.length; i++) {
      timeTexts.push($(timeSpans[i]).text());
    }

    return timeTexts;
  }

  function convertTextToSeconds(textTime) {
    var timeParts = textTime.split(':');

    var seconds = parseInt(timeParts[1]);

    seconds += parseInt(timeParts[0]) * 60;

    return seconds;
  }

  // get the summation of the times
  function sumTextTimes(textTimes) {
    var totalSeconds = 0;

    // get total minutes
    $.each(textTimes, function(index, textTime) {
      totalSeconds += convertTextToSeconds(textTime);
    });

    // convert back to hh:mm
    var hours = Math.floor(totalSeconds / 60 / 60);
    var remainingTime = totalSeconds - hours * 60 * 60;
    var minutes = Math.floor(remainingTime / 60);
    remainingTime = remainingTime - minutes * 60;
    var seconds = remainingTime;

    return getTime(hours, minutes, seconds);
  }

  // get the time in the following format -> hh:mm:ss
  function getTime(hours, minutes, seconds) {
    var result = '';

    // get the hours part
    if (hours > 0) {
      result += hours + ':';

      result += timePad(minutes);
    } else {
      // we didn't have any hours
      result += minutes;
    }

    // check for minutes
    if (minutes > 0) {
      result += ':' + timePad(seconds);
    } else {
      // we didn't have any minutes, but we should say 0
      result += '0:' + timePad(seconds);
    }

    return result;
  }

  // time should be a length of 2, so prepend with 0
  function timePad(timeSegment) {
    var result = timeSegment + '';

    while (result.length < 2) {
      result = '0' + result;
    }

    return result;
  }
})();
