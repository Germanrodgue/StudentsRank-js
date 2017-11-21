/**
 * Person class. We store personal information and attitudePoints that reflect daily classroom job
 *
 * @constructor
 * @param {string} name - Person name
 * @param {string} surname - Person surname
 * @param {array} attitudeTasks - Person awarded AttitudeTasks array   
 * @param {number} id - Person id default value null whwen created first time
 * @tutorial pointing-criteria
 */

import {
  formatDate,
  popupwindow,
  hashcode,
  loadTemplate
} from './utils.js';
import {
  context
} from './context.js';
import AttitudeTask from './attitudetask.js';
import GradedTask from './gradedtask.js';
import {
  saveStudents
} from './dataservice.js';
import {
  template
} from './templator.js';
import {
  uploadImage
} from './dataservice.js';

const privateAddXPPoints = Symbol('privateAddXPPoints'); /** To accomplish private method */
const _totalXPPoints = Symbol('TOTALXP_POINTS'); /** To acomplish private property */

class Person {
  constructor(name, surname, attitudeTasks, id = null) {
    this[_totalXPPoints] = 0;
    this.name = name;
    this.surname = surname;
    if (!id) {
      this.id = hashcode(this.name + this.surname);
    } else {
      this.id = id;
    }
    this.attitudeTasks = attitudeTasks;

    this.attitudeTasks.forEach(function (itemAT) {
      this[_totalXPPoints] += parseInt(itemAT['task'].points);
    }.bind(this));


  }

  /** Add points to person. we should use it carefully . */
  [privateAddXPPoints](points) {
    if (!isNaN(points)) {
      this[_totalXPPoints] += points;
      context.getTemplateRanking();
    }
  }

  /** Get person id  based on a 10 character hash composed by name+surname */
  getId() {
    return this.id;
  }

  /** Read person _totalXPPoints. A private property only modicable inside person instance */
  getTotalXPPoints() {
    return this[_totalXPPoints];
  }
  getTotalPoints() {
    var GT_Percent = localStorage.getItem('GT_Percent');
    var XP_Percent = localStorage.getItem('XP_Percent');

    var mark_GT = (parseInt(this.getGTtotalPoints()) * (GT_Percent / 100));


    var mark_XP = (parseInt(this.getTotalXPPoints()) * (XP_Percent / 100));


    return Math.round(parseInt(mark_GT + mark_XP));
  }
  /** Add a Attitude task linked to person with its own mark. */
  addAttitudeTask(taskInstance) {
    this.attitudeTasks.push({
      'task': taskInstance
    });
    this[privateAddXPPoints](parseInt(taskInstance.points));
    context.notify('Added ' + taskInstance.description + ' to ' + this.name + ',' + this.surname);
  }


  /** Get students Marks sliced by showNumGradedTasks from context*/
  getStudentMarks() {
    let gtArray = GradedTask.getStudentMarks(this.getId()).reverse();
    return gtArray.slice(0, context.showNumGradedTasks);
  }

  getGTtotalPoints() {
    return GradedTask.getStudentGradedTasksPoints(this.getId());
  }


  /** Renders person edit form, you can edit the avatar from this form, just the same as the addPerson Form */
  getHTMLEdit() {
    let callback = function (responseText) {
      document.getElementById('content').innerHTML = responseText;
      let saveStudent = document.getElementById('newStudent');
      document.getElementById('idFirstName').value = this.name;
      document.getElementById('idSurnames').value = this.surname;

      let avatar = document.getElementById('avatarupload');
      var image = "";

      avatar.onchange = function (evt) {

        var files = evt.target.files;

        var reader = new FileReader();

        reader.onload = function (frEvent) {
          image = frEvent.target.result; // save image encoded as Base64 inside the 'image' variable
        }
        reader.readAsDataURL(files[0]);

      }
      saveStudent.addEventListener('submit', () => {
        let oldId = this.getId();
        this.name = document.getElementById('idFirstName').value;
        this.surname = document.getElementById('idSurnames').value;
        let student = new Person(this.name, this.surname, this.attitudeTasks, this.id);
        context.students.set(student.getId(), student);
        saveStudents(JSON.stringify([...context.students]));

        //Send the Base64 image string and the id of the user to the server using uploadImage//
        var idImage = JSON.stringify([student.getId(), image]);
        uploadImage(idImage);
        //////////////////////////////////////////////

        context.getTemplateRanking();
      });
    }.bind(this);

    loadTemplate('templates/addStudent.html', callback);
  }
  /** Renders person detail view */
  getHTMLDetail() {
    loadTemplate('templates/detailStudent.html', function (responseText) {
      document.getElementById('content').innerHTML = responseText;
      let TPL_STUDENT = this;
      let scope = {};
      scope.TPL_ATTITUDE_TASKS = this.attitudeTasks.reverse();
      /*scope.TPL_GRADED_TASKS = [...context.gradedTasks.entries()];
      this.attitudeTasks.reverse().forEach(function(atItem) {
        TPL_ATTITUDE_TASKS += '<li class="list-group-item">' + atItem.task.points + '->' +
                      atItem.task.description + '->' + formatDate(new Date(atItem.task.datetime)) + '</li>';
      });
      */
      let TPL_GRADED_TASKS = '';
      context.gradedTasks.forEach(function (gtItem) {
        TPL_GRADED_TASKS += '<li class="list-group-item">' + gtItem.getStudentMark(TPL_STUDENT.getId()) + '->' +
          gtItem.name + '->' + formatDate(new Date(gtItem.datetime)) + '</li>';
      });
      let out = template(responseText, scope);
      console.log(out);
      document.getElementById('content').innerHTML = eval('`' + out + '`');
    }.bind(this));
  }
}

export default Person;