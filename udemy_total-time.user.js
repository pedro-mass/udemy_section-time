// ==UserScript==
// @name         Udemy - show section time
// @updateURL    https://openuserjs.org/meta/pedro-mass/My_Script.meta.js
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  For Udemy, displays the time a section has. It will display the total time if a section is completed or hasn't been started yet. Will display the remaining time if it's been started
// @copyright    2017, Pedro Mass (https://github.com/pedro-mass)
// @author       pedro-mass
// @match        *.udemy.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-3.2.0.min.js
// @require      https://greasyfork.org/scripts/5392-waitforkeyelements/code/WaitForKeyElements.js?version=115012
// @run-at       document-idle
// ==/UserScript==

(function() {
  var selectors = {
    sectionCard: 'curriculum-navigation-section',
    sectionName: '.curriculum-navigation__section__title',

    // class needed by this user script
    sectionTime: '.section-time',

    lectureItem: '.lecture__item',
    lectureTime: '.lecture__item__link__time',
    lectureStatus: '.cur-status',
    lectureCheck: '.udi-check',
  };

  run();

  // waits for the cards to be loaded
  waitForKeyElements(selectors.sectionCard, run);

  function run() {
    var sections = $(selectors.sectionCard);

    $.each(sections, function(index, section) {
      // remove previous time display
      $(section).find(selectors.sectionTime).remove();

      // get the section title
      var title = $(section).find(selectors.sectionName).text();

      // determine what times to get
      var isPartialTime = checkPartialTime(section);

      // get the times
      var timeTexts = getTimeTexts(section, isPartialTime);

      // sum the times
      var timeToDisplay = sumTextTimes(timeTexts);

      // display time
      var label = isPartialTime ? "Remaining Time - " : "Total Time - ";

      displayTime(section, timeToDisplay, label);
    });
  }

  /*
    Gets the section parts and checks if it's not 0 or the total parts
  */
  function checkPartialTime(section) {
    // get the section parts
    var sectionParts = getSectionParts(section);

    // determine what times to get
    var totalSections = sectionParts[1];
    var sectionsToGo = sectionParts[0];

    return sectionsToGo != 0 && sectionsToGo != totalSections;
  }

  /**
    Get the section's time. Whether partial or total is determined by the passed in
    parameter.
  */
  function getTimeTexts(section, isPartialTime) {
    // get the times
    var $lectures = $(section).find(selectors.lectureItem);

    // Check for partial time
    if (isPartialTime) {
      // filter down to just the non-completed ones
      $lectures = $lectures.filter(':not(.completed)');
    }

    // get the time spans
    var timeSpans = $lectures.find(selectors.lectureTime);

    // convert to timeTexts and return
    return convertTimeSpansToTexts(timeSpans);
  }

  function displayTime(section, totalTime, label) {
    var sectionTimeClass = 'section-time';

    // prepend to lecture status
    var totalTimeSpan = $(section).find(selectors.lectureStatus).find(sectionTimeClass);

    // check to see if we've already added the time to the DOM
    if (totalTimeSpan.length > 0) {
      $(totalTimeSpan[0]).text(label + totalTime);
    } else {
      // we haven't, so create the element and add it
      $(section).find(selectors.lectureStatus)
        .prepend('<span class="' +  sectionTimeClass + '" style="margin-right:1em">'+ label + totalTime + '</span>');
    }
  }

  function getSectionParts(section) {


    return $(section).find(selectors.lectureStatus).text()
      // split up the parts by "/"
      .split('/')
      // trim up the space
      .map(function(text) { return text.trim(); });
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
