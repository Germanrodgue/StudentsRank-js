/**
 * Context class. Devised to control every element involved in the app: students, gradedTasks ...
 *
 * @constructor
 * @tutorial pointing-criteria
 */

/*jshint -W061 */

import Person from './person.js';
import GradedTask from './gradedtask.js';
import {hashcode,getElementTd,deleteContent,loadTemplate} from './utils.js';

class Context {

  constructor() {
    this.students = new Map();
    this.gradedTasks = [];
    this.showNumGradedTasks = 1;

    if (localStorage.getItem('students')) {
      let students_ = new Map(JSON.parse(localStorage.getItem('students')));
      
      for (var [key, value] of students_) {
      
       var value = JSON.stringify(value);
       var value = JSON.parse(value);
      
       let p = new Person(value.name,value.surname, value.attitudeTasks,value.gradedTasks);
       this.students.set(key, p);
      
    }
      // for (let i = 0;i < students_.size;i++) {
      //   console.log(students_[i]);
        
      //   let p = new Person(students_[i].name,students_[i].surname,
      //     students_[i].attitudeTasks,students_[i].gradedTasks);
      //   this.students.set(p);
       
      // }
    }
    if (localStorage.getItem('gradedTasks')) {
      this.gradedTasks = JSON.parse(localStorage.getItem('gradedTasks'));
    }
  }

  /** Draw Students rank table in descendent order using points as a criteria */
  getTemplateRanking() {
    
   
  
    if (this.students && this.students.size > 0) {
     
      /* We sort students descending from max number of points to min */
      // [...this.students].sort(function(a, b) {
      //   console.log(b[1].getTotalPoints());
      //   console.log(a[1].getTotalPoints());
      //   return (b[1].getTotalPoints() - a[1].getTotalPoints());
      // });
      // console.log([...this.students]);
      var st = new Map([...this.students.entries()].sort((a,b) => a[1].getTotalPoints() < b[1].getTotalPoints()));
     console.log(st);
     // var mapAsc = new Map([...map.entries()].sort((a,b) => a[0] > b[0]));
      //this.students.set(hashcode(st.name + st.surname), st);
      
      localStorage.setItem('students',JSON.stringify([...st]));

    //  localStorage.setItem('students',new Map('hash', JSON.stringify(this.students)));
      let GRADED_TASKS = '';
      this.gradedTasks.forEach(function(taskItem) {
        GRADED_TASKS += '<td>' + taskItem.name + '</td>';
      });

      loadTemplate('templates/rankingList.html',function(responseText) {
              document.getElementById('content').innerHTML = eval('`' + responseText + '`');
              let tableBody = document.getElementById('idTableRankingBody');
              st.forEach(function(studentItem) {
                console.log(studentItem);
                let liEl = studentItem.getHTMLView();
                tableBody.appendChild(liEl);
              });
            }.bind(this));
    }
  }

  /** Create a form to create a GradedTask that will be added to every student */
  addGradedTask() {

    let callback = function(responseText) {
            let saveGradedTask = document.getElementById('newGradedTask');

            saveGradedTask.addEventListener('submit', () => {
              let name = document.getElementById('idTaskName').value;
              let description = document.getElementById('idTaskDescription').value;
              let weight = document.getElementById('idTaskWeight').value;
              let gtask = new GradedTask(name,description,weight);
              this.gradedTasks.push(gtask);
              localStorage.setItem('gradedTasks',JSON.stringify(this.gradedTasks));
              this.students.forEach(function(studentItem) {
                studentItem.addGradedTask(gtask);
              });
              this.getTemplateRanking();
            });
          }.bind(this);

    loadTemplate('templates/addGradedTask.html',callback);
  }
  /** Add a new person to the context app */
  addPerson() {

    let callback = function(responseText) {
            let saveStudent = document.getElementById('newStudent');

            saveStudent.addEventListener('submit', () => {
              let name = document.getElementById('idFirstName').value;
              let surnames = document.getElementById('idSurnames').value;
              let student = new Person(name,surnames,[],[]);
              this.gradedTasks.forEach(function(iGradedTask) {
                    student.addGradedTask(new GradedTask(iGradedTask.name));
                  });
              this.students.set(hashcode(student.name + student.surname), student);
            
              localStorage.setItem('students',JSON.stringify([...this.students]));
            });
          }.bind(this);

    loadTemplate('templates/addStudent.html',callback);
  }
  /** Add last action performed to lower information layer in main app */

  notify(text) {
    document.getElementById('notify').innerHTML = text;
  }
}

export let context = new Context(); //Singleton export
