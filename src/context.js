/**
 * Context class. Devised to control every element involved in the app: students, gradedTasks ...
 *
 * @constructor
 * @tutorial pointing-criteria
 */

/*jshint -W061 */

import Person from './person.js';
import GradedTask from './gradedtask.js';
import {
  hashcode,
  getElementTd,
  deleteContent,
  loadTemplate
} from './utils.js';

class Context {

  constructor() {
    this.students = new Map();
    this.gradedTasks = new Map();
    this.showNumGradedTasks = 1;

    if (localStorage.getItem('students')) {
      let students_ = new Map(JSON.parse(localStorage.getItem('students')));

      for (var [key, value] of students_) {

        value = JSON.stringify(value);
        value = JSON.parse(value);

        let p = new Person(value.name, value.surname, value.attitudeTasks, value.gradedTasks);
        this.students.set(key, p);

      }

    }
    if (localStorage.getItem('gradedTasks')) {

      let gradedTasks_ = new Map(JSON.parse(localStorage.getItem('gradedTasks')));

      for (var [k, v] of gradedTasks_) {

        v = JSON.stringify(v);
        v = JSON.parse(v);

        let g = new GradedTask(v.name);

        this.gradedTasks.set(k, g);


      }

    }
  }

  /** Draw Students rank table in descendent order using points as a criteria */
  getTemplateRanking() {

    if (this.students && this.students.size > 0) {
      var st = new Map([...this.students.entries()].sort((a, b) => a[1].getTotalPoints() < b[1].getTotalPoints()));

      localStorage.setItem('students', JSON.stringify([...st]));

      console.log(this.gradedTasks);
      let GRADED_TASKS = '';
      this.gradedTasks.forEach(function (taskItem) {
        GRADED_TASKS += '<td>' + taskItem.name + '</td>';
      });

      loadTemplate('templates/rankingList.html', function (responseText) {
        document.getElementById('content').innerHTML = eval('`' + responseText + '`');
        let tableBody = document.getElementById('idTableRankingBody');
        st.forEach(function (studentItem) {

          let liEl = studentItem.getHTMLView();
          tableBody.appendChild(liEl);
        });
      }.bind(this));
    }
  }

  /** Create a form to create a GradedTask that will be added to every student */
  addGradedTask() {

    let callback = function (responseText) {
      let saveGradedTask = document.getElementById('newGradedTask');

      saveGradedTask.addEventListener('submit', () => {
        let name = document.getElementById('idTaskName').value;
        let description = document.getElementById('idTaskDescription').value;
        let weight = document.getElementById('idTaskWeight').value;
        let gtask = new GradedTask(name, description, weight);
        this.gradedTasks.set(hashcode(name), gtask);
        localStorage.setItem('gradedTasks', JSON.stringify([...this.gradedTasks]));
        this.students.forEach(function (studentItem) {
          studentItem.addGradedTask(gtask);
        });
        this.getTemplateRanking();
      });
    }.bind(this);

    loadTemplate('templates/addGradedTask.html', callback);
  }
  /** Add a new person to the context app */
  addPerson() {

    let callback = function (responseText) {
      let saveStudent = document.getElementById('newStudent');

      saveStudent.addEventListener('submit', () => {
        let name = document.getElementById('idFirstName').value;
        let surnames = document.getElementById('idSurnames').value;
        let student = new Person(name, surnames, [], []);
        this.gradedTasks.forEach(function (iGradedTask) {
          student.addGradedTask(new GradedTask(iGradedTask.name));
        });
        this.students.set(hashcode(student.name + student.surname), student);

        localStorage.setItem('students', JSON.stringify([...this.students]));
      });
    }.bind(this);

    loadTemplate('templates/addStudent.html', callback);
  }

  /** Update the selected student using a new form */
  updateStudent(hash) {

    let callback = function (responseText) {
      let saveStudent = document.getElementById('newStudent');

      saveStudent.addEventListener('submit', () => {

        let name = document.getElementById('idFirstName').value;
        let surnames = document.getElementById('idSurnames').value;
        var StudentOld = context.students.get(eval(hash));

        context.students.delete(eval(hash));
        let student = new Person(name, surnames, StudentOld.attitudeTasks, StudentOld.gradedTasks);

        this.students.set(hashcode(student.name + student.surname), student);

        localStorage.setItem('students', JSON.stringify([...this.students]));
      });
    }.bind(this);

    loadTemplate('templates/updateStudent.html', callback);
  }

  /** Delete the selected student */
  deleteStudent(hash) {

    let callback = function (responseText) {

      var response = window.confirm("Do you really want to delete this student?");

      if (response === true) {
        context.students.delete(eval(hash));

        localStorage.removeItem('students');
        localStorage.setItem('students', JSON.stringify([...context.students]));
        window.alert('Student deleted');
        window.location.href = "#";

      }

    }.bind(this);

    loadTemplate("", callback);
  }
  /** Add last action performed to lower information layer in main app */

  notify(text) {
    document.getElementById('notify').innerHTML = text;
  }
}

export let context = new Context(); //Singleton export