import Task from './task.js';

/**
 * AttitudeTask class. Create a attitude task in order to be
 * assigned to an individual or group of students. This could be for
 * example , participative attitude at class. Point a good 
 * question in class. Be the first finishing some exercise ...
 * 
 * @constructor
 * @param {string} name - task name
 * @param {string} description - task description
 * @param {string} points - task points associated to that behaviour
 * @tutorial pointing-criteria
 */

import {
  hashcode,
  popupwindow,
  loadTemplate
} from '../lib/utils.js';
import {
  context
} from '../context.js';
import {
  saveAttitudeTasks,
  loadAttitudeTasks,
  updateFromServer
} from '../dataservice.js';
import {
  template
} from '../lib/templator.js';

const ATSTUDENT_MARKS = Symbol('ATSTUDENT_MARKS');
class AttitudeTask extends Task {
  constructor(name, description, points, id, hits) {
    super(name, description);
    this.id = id;
    this.points = points;
    this.hits = hits;
  }

  addATTMark(idStudent, ATPoints) {
    context.attitudeTasks.set(parseInt(idStudent), ATPoints);

    saveAttitudeTasks(JSON.stringify([...context.attitudeTasks]));
  }
  static getATTMark(Taskid) {
    var task = context.getATTById(Taskid);
    return task.points;
  }
  /** Open window dialog associated to a person instance and let us award him with some XP points */
  static addXP(personInstance) {
    let scope = {};
    let XParrayFromMap = [...context.attitudeTasks.entries()];
    XParrayFromMap.sort(function (a, b) {
      return (b[1].hits - a[1].hits);
    });
    scope.XP_TASKS = XParrayFromMap;
    let callback = function (responseText) {
      let out = template(responseText, scope);
      $('#content').html($('#content').html() + eval('`' + out + '`'));
      $('#XPModal').modal('toggle');
      $('.xp').each(function (index) {
        $(this).click(function () {
          $('#XPModal').modal('toggle');
          $('.modal-backdrop').remove();
          var task = context.getATTById(this.id);
          task.hits += 1;
          [...context.attitudeTasks].push(task);
          saveAttitudeTasks(JSON.stringify([...context.attitudeTasks]));
          var TaskIns = {
            'id': $(".xp").attr('id')
          };
          personInstance.addAttitudeTask(TaskIns);
          context.getTemplateRanking();
        });
      });
      $('#sendTask').click(function () {
        var datetime = new Date();
        var hashAT = hashcode(datetime + $("#text").val());
        var TaskIns = {
          'id': hashAT
        };
        personInstance.addAttitudeTask(TaskIns);

        var ATTASK = new AttitudeTask($("#text").val(), $("#text").val(), $("#points").val(), hashAT, 0);
        ATTASK.addATTMark(hashAT, $("#points").val());
        context.attitudeTasks.set(hashAT, ATTASK);

        saveAttitudeTasks(JSON.stringify([...context.attitudeTasks]));
      });


    }
    loadTemplate('templates/listAttitudeTasks.2.html', callback);
  }
}

export default AttitudeTask;