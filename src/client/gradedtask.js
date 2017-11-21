'use strict';

import Task from './task.js';
import {
  loadTemplate,
  hashcode
} from './utils.js';
import {
  saveGradedTasks
} from './dataservice.js';
import {
  context
} from './context.js';

/**
 * GradedTask class. Create a graded task in order to be evaluated 
 * for every student engaged. Theory tests and procedure practices 
 * are part of this category.
 * @constructor
 * @param {string} name - task name
 * @param {string} description - task description
 * @param {number} weight - task weight %
 * @param {number} id - task id default null when created for first time
 * @tutorial pointing-criteria
 */

const STUDENT_MARKS = Symbol('STUDENT_MARKS'); /** To acomplish private property */

class GradedTask extends Task {
  constructor(name, description, weight, studentsMark, id = null) {
    super(name, description, id);
    this.weight = weight;
    this.studentsMark = studentsMark;
    this[STUDENT_MARKS] = new Map(studentsMark); //We need a private map to make it easier to access student marks using its id. The problem is that a Map inside other map can be converted to a pair array
  }

  /** Add student mark using his/her person ID   */
  addStudentMark(idStudent, markPoints) {
    this[STUDENT_MARKS].set(parseInt(idStudent), markPoints);
    this.studentsMark = [...this[STUDENT_MARKS].entries()];
    saveGradedTasks(JSON.stringify([...context.gradedTasks]));
  }

  /** Static method to get list marks associated with one student */
  static getStudentMarks(idStudent) {
    let marks = [];
    context.gradedTasks.forEach(function (valueGT, keyGT, gradedTasks_) {
      marks.push([valueGT.getId(), valueGT[STUDENT_MARKS].get(idStudent)]);
    });
    return marks;
  }
  /** Calculate total graded points associated to one student */
  static getStudentGradedTasksPoints(idStudent) {
    let points = 0;
    context.gradedTasks.forEach(function (itemTask) {
      points += itemTask[STUDENT_MARKS].get(idStudent) * (itemTask.weight / 100);
    });
    return Math.round((points * 100) / 100);
  }

  /** Get student mark by their person ID */
  getStudentMark(idStudent) {
    return this[STUDENT_MARKS].get(idStudent);
  }

  static getWeightTasks() {
    var weight = 0;
    [...context.gradedTasks].forEach(function (gradedTasks) {
      weight += parseInt(gradedTasks[1].weight);
    });
    return weight;
  }
  /** Update a GradedTask, weight control in the form, you cannot add more total weight than 100% */
  getHTMLEdit() {
    let callback = function (responseText) {
      let PERCENT_TASKS = '';
      let PERCENT_TASKS_CONTROL_UPDATE = '';
      let PERCENT_TASKS_CONTROL_ADD = '';
      let STUDENTS_LIST_WITH_GRADE = '';
      var weight = GradedTask.getWeightTasks();
      var res_weight = ((100 - weight) + parseInt(this.weight));

      if (res_weight == 0) {
        PERCENT_TASKS = '0';
        PERCENT_TASKS_CONTROL_UPDATE = '0';
      } else {
        PERCENT_TASKS = '1 - ' + res_weight;
        PERCENT_TASKS_CONTROL_UPDATE = res_weight;
      }
      document.getElementById('content').innerHTML = eval('`' + responseText + '`');
      let saveGradedTask = document.getElementById('newGradedTask');
      document.getElementById('idTaskName').value = this.name;
      document.getElementById('idTaskDescription').value = this.description;
      document.getElementById('idTaskWeight').value = this.weight;

      saveGradedTask.addEventListener('submit', () => {
        let oldId = this.getId();
        this.name = document.getElementById('idTaskName').value;
        this.description = document.getElementById('idTaskDescription').value;
        this.weight = document.getElementById('idTaskWeight').value;
        let gradedTask = new GradedTask(this.name, this.description, this.weight, this.studentsMark, this.id);
        context.gradedTasks.set(this.id, gradedTask);
        saveGradedTasks(JSON.stringify([...context.gradedTasks]));
      });
    }.bind(this);

    loadTemplate('templates/addGradedTask.html', callback);
  }
}

export default GradedTask;