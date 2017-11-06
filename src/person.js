/**
 * Person class. We store personal information and attitudePoints that reflect daily classroom job
 *
 * @constructor
 * @param {string} name - Person name
 * @param {string} surname - Person surname
 * @param {array} attitudeTasks - Person awarded AttitudeTasks array   
 * @param {array} gradedTasks - Person gradedTasks array
 * @tutorial pointing-criteria
 */

import {
  formatDate,
  popupwindow,
  hashcode,
  getElementTd,
  loadTemplate
} from './utils.js';
import {
  context
} from './context.js';
import AttitudeTask from './attitudetask.js';

const privateAddTotalPoints = Symbol('privateAddTotalPoints'); /** To accomplish private method */
const _totalPoints = Symbol('TOTAL_POINTS'); /** To acomplish private property */

class Person {
  constructor(name, surname, attitudeTasks, gradedTasks) {
    this[_totalPoints] = 0;
    this.name = name;
    this.surname = surname;

    this.attitudeTasks = attitudeTasks;
    this.gradedTasks = gradedTasks;

    this.attitudeTasks.forEach(function (itemAT) {
      this[_totalPoints] += parseInt(itemAT['task'].points);
    }.bind(this));
    this.gradedTasks.forEach(function (itemGT) {
      this[_totalPoints] += parseInt(itemGT.points);
    }.bind(this));
  }

  /** Add points to persons we should carefully use it. */
  [privateAddTotalPoints](points) {
    if (!isNaN(points)) {
      this[_totalPoints] += points;
      context.getTemplateRanking();
    }
  }

  /** Read person _totalPoints. A private property only modificable inside person instance */
  getTotalPoints() {
    return this[_totalPoints];
  }

  /** Add a gradded task linked to person with its own mark. */
  addGradedTask(taskInstance) {
    this.gradedTasks.push({
      'task': taskInstance,
      'points': 0
    });
  }

  /** Add a Attitude task linked to person with its own mark. */
  addAttitudeTask(taskInstance) {
    this.attitudeTasks.push({
      'task': taskInstance
    });
    this[privateAddTotalPoints](parseInt(taskInstance.points));
    context.notify('Added ' + taskInstance.description + ' to ' + this.name + ',' + this.surname);
  }

  /** Renders HTML person view Create a table row (tr) with
   *  all name, attitudePoints , and one input for 
   * every gradded task binded for that person. We use a routing system to bind the buttons action */
  getHTMLView() {
    let liEl = document.createElement('tr');
    let newlink = document.createElement('a'); 
    let newlinktext = document.createElement('a');
    var hash = hashcode(this.name + this.surname)
    let text = document.createElement('span');
    text.innerHTML="update ";
    newlinktext.setAttribute('href', '#update:' + hash);
    newlinktext.appendChild(text);
    liEl.appendChild(newlinktext);

    let newlinkdelete = document.createElement('a');
    
    let textdelete = document.createElement('span');
    textdelete.innerHTML=" delete";
    newlinkdelete.setAttribute('href', '#delete:' + hash);
    newlinkdelete.appendChild(textdelete);
    liEl.appendChild(newlinkdelete);

    let esEL = getElementTd(this.surname + ', ' + this.name);
    newlink.appendChild(esEL);
    hash = hashcode(this.name + this.surname)
    newlink.setAttribute('href', '#details:' + hash);

    liEl.appendChild(newlink);

    liEl.appendChild(getElementTd(this[_totalPoints]));
    let newlinkTask = document.createElement('a');
    newlinkTask.setAttribute('href', '#addATask:' + hash);
    let addAttitudeTaskEl = document.createElement('button');
    let tb = document.createTextNode('+XP');
    addAttitudeTaskEl.appendChild(tb);
    newlinkTask.appendChild(addAttitudeTaskEl);
    liEl.appendChild(getElementTd(newlinkTask));


    let that = this;

    this.gradedTasks.forEach(function (gTaskItem) {
      let inputEl = document.createElement('input');
      inputEl.type = 'number';
      inputEl.min = 0;
      inputEl.max = 100;
      inputEl.value = gTaskItem['points'];
      inputEl.addEventListener('change', function (event) {
        that[privateAddTotalPoints](parseInt(gTaskItem['points'] * (-1)));
        gTaskItem['points'] = inputEl.value;
        that[privateAddTotalPoints](parseInt(gTaskItem['points']));
      });
      liEl.appendChild(getElementTd(inputEl));
    });

    return liEl;
  }
}

export default Person;