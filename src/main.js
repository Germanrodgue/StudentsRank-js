'use strict';

import AttitudeTask from './attitudetask.js';
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

/** Once the page is loaded we get a context app object an generate students rank view, also we change the path to the index*/
window.onload = function () {
  window.history.replaceState({}, document.title, "/");
  context.getTemplateRanking();
};


/** routing system */
window.onhashchange = function () {


  switch (window.location.hash) {
    case /#details:\d*/.test(window.location.hash) && window.location.hash:
      var split_hash = window.location.hash.split(/:/);
      console.log(split_hash[1]);
      var hash = split_hash[1];
       hash = hash.replace(/\s+/, "");
      console.log(context.students.get(eval(hash)));
      var student = context.students.get(eval(hash));
      loadTemplate('templates/detailStudent.html', function (responseText) {
        let STUDENT = student;
        let ATTITUDE_TASKS = '';
        student.attitudeTasks.reverse().forEach(function (atItem) {
          console.log(atItem.task.points);
          ATTITUDE_TASKS += '<li>' + atItem.task.points + '->' +
            atItem.task.description + '->' + formatDate(new Date(atItem.task.datetime)) + '</li>';
        });
        let GRADED_TASKS = '';
        student.gradedTasks.forEach(function (gtItem) {
          GRADED_TASKS += '<li>' + gtItem.points + '->' +
            gtItem.task.name + '->' + formatDate(new Date(gtItem.task.datetime)) + '</li>';
        });
        document.getElementById('content').innerHTML = eval('`' + responseText + '`');
      });
      break;
    case '#addStudent':
      context.addPerson();
      break;
    case '#addGTask':
      context.addGradedTask();
      break;
    case /#addATask:\d*/.test(window.location.hash) && window.location.hash:
      var split_hash = window.location.hash.split(/:/);
      var hash = split_hash[1];
      var hash = hash.replace(/\s+/, "");
      
      var student = context.students.get(eval(hash));


      let popUp = popupwindow('templates/listAttitudeTasks.html', 'XP points to ' + student.name, 300, 400);
     
      let personInstance = student;
   
      popUp.onload = function () {
        popUp.document.title = personInstance.name + ' ' +
          personInstance.surname + ' XP points';
        let xpButtons = popUp.document.getElementsByClassName('xp');
        Array.prototype.forEach.call(xpButtons, function (xpBItem) {
          xpBItem.addEventListener('click', () => {
            popUp.close();
          
            personInstance.addAttitudeTask(new AttitudeTask('XP task',
              xpBItem.innerHTML, xpBItem.value));
          });
        });
      };
      break;
      case /#update:\d*/.test(window.location.hash) && window.location.hash:
      var split_hash = window.location.hash.split(/:/);
      var hash = split_hash[1];
      var hash = hash.replace(/\s+/, "");
      
      context.updateStudent(hash);
      break;
      case /#delete:\d*/.test(window.location.hash) && window.location.hash:
      var split_hash = window.location.hash.split(/:/);
      var hash = split_hash[1];
      var hash = hash.replace(/\s+/, "");
      
      context.deleteStudent(hash);
      break;
  }
}