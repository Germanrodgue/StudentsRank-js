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
  updateFromServer,
  saveStudents,
  saveGradedTasks,
  uploadImage
} from './dataservice.js';
import {
  hashcode,
  loadTemplate,
  setCookie,
  getCookie
} from './utils.js';
import {
  generateMenu
} from './menu.js';
import {
  template
} from './templator.js';

class Context {

  constructor() {
    this.students = new Map();
    this.gradedTasks = new Map();
    this.showNumGradedTasks = 1; //Max visible graded tasks in ranking list table
    if (getCookie('user')) {
      this.user = JSON.parse(getCookie('user'));
    }
  }

  /** Check if user is logged */
  isLogged() {
    loadTemplate('api/loggedin', function (response) {
      if (response === '0') {
        //alert('LOGGED IN 0');
        this.user = undefined;
        this.login();
        return false;
      } else {
        //alert('LOGGED IN TRUE');
        this.user = JSON.parse(response);
        updateFromServer();
        this.getTemplateRanking();
        return true;
      }
    }.bind(this), 'GET', '', false);
  }

  /** Show login form template when not authenticated */
  login() {
    let that = this;
    if (!this.user) {
      loadTemplate('templates/login.html', function (responseText) {
        that.hideMenu();
        document.getElementById('content').innerHTML = eval('`' + responseText + '`');
        let loginForm = document.getElementById('loginForm');

        loginForm.addEventListener('submit', (event) => {
          event.preventDefault();
          let username = document.getElementsByName('username')[0].value;
          let password = document.getElementsByName('password')[0].value;
          loadTemplate('api/login', function (userData) {
            that.user = JSON.parse(userData);
            setCookie('user', userData, 7);
            updateFromServer();
            that.getTemplateRanking();
          }, 'POST', 'username=' + username + '&password=' + password, false);
          return false; //Avoid form submit
        });
      });
    } else {
      generateMenu();
      that.getTemplateRanking();
    }
  }

  // Used to show menu when user logs in
  showMenu() {
    document.getElementById('menuButtons').style.visibility = 'visible';
    document.getElementById('notify').style.visibility = 'visible';
  }

  //Used to hide the menu when user logged off
  hideMenu() {
    document.getElementById('menuButtons').style.visibility = 'hidden';
    document.getElementById('notify').style.visibility = 'hidden';
  }

  /** Get a Person instance by its ID */
  getPersonById(idHash) {
    return this.students.get(parseInt(idHash));
  }
  /** Get a GradedTask instance by its ID */
  getGradedTaskById(idHash) {
    return this.gradedTasks.get(parseInt(idHash));
  }
  /** Draw Students ranking table in descendent order using total points as a criteria */
  getTemplateRanking() {
    generateMenu();
    this.showMenu();

    if (this.students && this.students.size > 0) {
      
      /* We sort students descending from max number of points to min */
      let arrayFromMap = [...this.students.entries()];
      arrayFromMap.sort(function (a, b) {
        return (b[1].getTotalPoints() - a[1].getTotalPoints()); //Now students is sorted by TotalPoints
      });
      this.students = new Map(arrayFromMap);
      console.log([...this.students]);
      saveStudents(JSON.stringify([...this.students]));
      let TPL_GRADED_TASKS = '';

      if (this.gradedTasks && this.gradedTasks.size > 0) {
        if (this.showNumGradedTasks >= this.gradedTasks.size) {
          this.showNumGradedTasks = this.gradedTasks.size;
        }
        let arrayGradedTasks = [...this.gradedTasks.entries()].reverse();
        for (let i = 0; i < this.showNumGradedTasks; i++) {
          if (i === (this.showNumGradedTasks - 1)) {
            TPL_GRADED_TASKS += '<th><a href="#detailGradedTask/' + arrayGradedTasks[i][0] + '">' +
              arrayGradedTasks[i][1].name + '(' + arrayGradedTasks[i][1].weight + '%)&nbsp;</a><a href="#MoreGradedTasks"><button id="more_gt"><img src="../css/img/righthand.png" width="20" height="20" /></button></a></th>';
          } else {
            TPL_GRADED_TASKS += '<th><a href="#detailGradedTask/' + arrayGradedTasks[i][0] + '">' + arrayGradedTasks[i][1].name + '(' + arrayGradedTasks[i][1].weight + '%)</a></th>';
          }
        }
      }
      let scope = {};
      scope.TPL_GRADED_TASKS = TPL_GRADED_TASKS;
      scope.TPL_PERSONS = arrayFromMap;

      loadTemplate('templates/rankingList.html', function (responseText) {
        let out = template(responseText, scope);
        //console.log(out);
        document.getElementById('content').innerHTML = eval('`' + out + '`');
        let that = this;
        let callback = function () {
          let gtInputs = document.getElementsByClassName('gradedTaskInput');
          Array.prototype.forEach.call(gtInputs, function (gtInputItem) {
            gtInputItem.addEventListener('change', () => {
              let idPerson = gtInputItem.getAttribute('idStudent');
              let idGradedTask = gtInputItem.getAttribute('idGradedTask');
              let gt = that.gradedTasks.get(parseInt(idGradedTask));
              gt.addStudentMark(idPerson, gtInputItem.value);
              that.getTemplateRanking();
            });
          });
        };
        callback();
      }.bind(this));
    } else {
      document.getElementById('content').innerHTML = '';
    }
  }

  ///Used to recalculate the weight of the XP Tasks & GT Tasks. Settings saved in localStorage.
  Settings() {

    let callback = function (responseText) {
      document.getElementById('content').innerHTML = responseText;

      var Slider = document.getElementById('myRange');
      var GTP = document.getElementById('GTPercent');
      var XPP = document.getElementById('XPPercent');
      var Storage = localStorage.getItem('XP_Percent');

      if (Storage) {
        var GT_PERCENT = localStorage.getItem('GT_Percent');
        var XP_PERCENT = localStorage.getItem('XP_Percent');
        Slider.value = GT_PERCENT;
        GTP.innerHTML = GT_PERCENT;
        XPP.innerHTML = XP_PERCENT;
      } else {
        var GT_PERCENT = '85';
        var XP_PERCENT = '15';
        Slider.value = GT_PERCENT;
        GTP.innerHTML = GT_PERCENT;
        XPP.innerHTML = XP_PERCENT;
      }


      localStorage.setItem('XP_Percent', XP_PERCENT);
      localStorage.setItem('GT_Percent', GT_PERCENT);

      Slider.addEventListener('change', () => {
        GT_PERCENT = Slider.value;

        GTP.innerHTML = GT_PERCENT;
        XP_PERCENT = parseInt(100 - parseInt(Slider.value));
        localStorage.setItem('XP_Percent', XP_PERCENT);
        localStorage.setItem('GT_Percent', GT_PERCENT);
        XPP.innerHTML = XP_PERCENT;

      });
    }.bind(this);
    loadTemplate('templates/Settings.html', callback);
  }
  /** Create a form to create a GradedTask that will be added to every student, weight control in the form, you cannot add more total weight than 100% */
  addGradedTask() {

    let callback = function (responseText) {

      let PERCENT_TASKS = '';
      let STUDENTS_LIST_WITH_GRADE = '';
      let PERCENT_TASKS_CONTROL_ADD = '';
      let PERCENT_TASKS_CONTROL_UPDATE = '';
      var weight = GradedTask.getWeightTasks();
      var res_weight = (100 - weight);

      if (res_weight == 0) {

        PERCENT_TASKS = '0';
        PERCENT_TASKS_CONTROL_ADD = '0';
      } else {
        PERCENT_TASKS = '1 - ' + res_weight;
        PERCENT_TASKS_CONTROL_ADD = res_weight;
      }
      document.getElementById('content').innerHTML = eval('`' + responseText + '`');

      let saveGradedTask = document.getElementById('newGradedTask');

      saveGradedTask.addEventListener('submit', () => {
        let name = document.getElementById('idTaskName').value;
        let description = document.getElementById('idTaskDescription').value;
        let weight = document.getElementById('idTaskWeight').value;
        let gtask = new GradedTask(name, description, weight, []);
        let gtaskId = gtask.getId();
        this.students.forEach(function (studentItem, studentKey, studentsRef) {
          gtask.addStudentMark(studentKey, 0);
        });
        this.gradedTasks.set(gtaskId, gtask);
        saveGradedTasks(JSON.stringify([...this.gradedTasks]));
        this.getTemplateRanking();
        return false; //Avoid form submit
      });
    }.bind(this);

    loadTemplate('templates/addGradedTask.html', callback);
  }
  /** Add a new person to the context app, avatar input included */
  addPerson() {

    let callback = function (responseText) {
      document.getElementById('content').innerHTML = responseText;
      let saveStudent = document.getElementById('newStudent');
      let avatar = document.getElementById('avatarupload'); //Get the element that contais the data related to the image
      var image = "";

      avatar.onchange = function (evt) {

        var files = evt.target.files;

        var reader = new FileReader();

        reader.onload = function (frEvent) {
          image = frEvent.target.result; // save image encoded as Base64 inside the 'image' variable
        }
        reader.readAsDataURL(files[0]);

      }
      saveStudent.addEventListener('submit', (event) => {
        event.preventDefault();
        let name = document.getElementById('idFirstName').value;
        let surnames = document.getElementById('idSurnames').value;
        let student = new Person(name, surnames, []);
        this.gradedTasks.forEach(function (iGradedTask) {
          iGradedTask.addStudentMark(student.getId(), 0);
        });
        this.students.set(student.getId(), student);

        //Send the Base64 image string and the id of the user to the server using uploadImage//
        var idImage = JSON.stringify([student.getId(), image]);
        uploadImage(idImage); 
        //////////////////////////////////////////////


        this.getTemplateRanking();
        return false; //Avoid form submit
      });
    }.bind(this);

    loadTemplate('templates/addStudent.html', callback);
  }
  /** Add last action performed to lower information layer in main app */
  notify(text) {
    document.getElementById('notify').innerHTML = text;
  }
}

export let context = new Context(); //Singleton export