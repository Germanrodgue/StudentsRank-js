'use strict';

import {
  context
} from './context.js';
import {
  formatDate,
  popupwindow,
  hashcode,
  getElementTd,
  loadTemplate
} from './utils.js';
/** Once the page is loaded we get a context app object an generate students rank view. */
window.onload = function () {
  window.history.replaceState({}, document.title, "/");
  context.getTemplateRanking();


};
window.onhashchange = function () {


  switch (window.location.hash) {
    case '#details':
      /* loadTemplate('templates/detailStudent.html',function(responseText) {
         let STUDENT = this;
         let ATTITUDE_TASKS = '';
         this.attitudeTasks.reverse().forEach(function(atItem) {
           ATTITUDE_TASKS += '<li>' + atItem.task.points + '->' + atItem.task.description + '->' + formatDate(new Date(atItem.task.datetime)) + '</li>';
         });
         let GRADED_TASKS = '';
         this.gradedTasks.forEach(function(gtItem) {
           GRADED_TASKS += '<li>' + gtItem.points + '->' +
                         gtItem.task.name + '->' + formatDate(new Date(gtItem.task.datetime)) + '</li>';
         });
         document.getElementById('content').innerHTML = eval('`' + responseText + '`');*/
      break;
    case '#addStudent':
      context.addPerson();
      break;
    case '#addGTask':
      context.addGradedTask();
      break;
  }
}