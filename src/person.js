/**
 * Person class. We store personal information and points that reflect daily classroom job
 *
 * @constructor
 * @param {string} name - Person name
 * @param {string} surname - Person surname
 * @param {number} points - Person total points 
 * @tutorial pointing-criteria
 */

import {
  hashcode,
  getElementTd
} from './utils.js';
import {
  context
} from './context.js';
class Person {
  constructor(name, surname, points) {
    this.name = name;
    this.surname = surname;
    this.points = points;
    this.gradedTasks = [];

  }

  /** Add points to persons we should carefully use it. */
  addPoints(points) {
    this.points += points;
  }

  /** Add a gradded task linked to person with its own mark. */
  addGradedTask(taskInstance) {
    this.gradedTasks.push({
      "task": taskInstance,
      "points": 0
    });

  }
  /** Renders HTML person view Create a table row (tr) with all name, points , add button and one input for every gradded task binded for that person. */
  getHTMLView() {
    var liEl = document.createElement("tr");

    liEl.appendChild(getElementTd(this.surname + ", " + this.name));

    liEl.appendChild(getElementTd(this.points));

    var addPointsEl = document.createElement("button");
    var tb = document.createTextNode("+20");
    addPointsEl.appendChild(tb);

    liEl.appendChild(getElementTd(addPointsEl));

    addPointsEl.addEventListener("click", () => {

      this.addPoints(20);
      localStorage.setItem("Students", JSON.stringify(context.students));
      setTimeout(function () {
        context.getRanking();
      }.bind(this), 1000);
    });

    let that = this;
    this.calculatedPoints = 0;
    this.gradedTasks.forEach(function (gTaskItem) {
      let inputEl = document.createElement("input");
      inputEl.type = "number";
      inputEl.min = 0;
      inputEl.max = 100;
      inputEl.value = gTaskItem.points;
      inputEl.addEventListener("change", function (event) {
        that.addPoints(eval(gTaskItem.points) * (-1));
        gTaskItem.points = inputEl.value;
        that.addPoints(eval(gTaskItem.points));
        localStorage.setItem("Students", JSON.stringify(context.students));
        context.getRanking();
      });

      liEl.appendChild(getElementTd(inputEl));
    });


    return liEl;
  }


}

export default Person;

// gulp jhint(quality things) and jscs(syntax) --> 1 points  .jshint google rules
// inheritance mechanism task -> gradedtask, attitudetask --> 1 point
// Documentate properly your code --> 1 point -> jsdoc3 syntax
// Decent template mechanism --> 2 points
// Using Context class as a singleton --> 1 point
// App has a good behaviour and is complete: local storage, functionality is correct using properly 
// the memory --> 2 points

//Improvements (css)--> 2 points