/**
 * Context class. Devised to control every element involved in the app: students, gradedTasks ...
 *
 * @constructor
 * @tutorial pointing-criteria
 */

import Person from './person.js';
import GradedTask from './gradedtask.js';
import {
    hashcode,
    getElementTd,
    loadHtml
} from './utils.js';

class Context {

    constructor() {
        this.students = [];
        this.gradedTasks = [];
        this.StudentsLocalStorage();
        this.TasksLocalStorage();

    }

    //Load the Students from the local storage of the browser
    StudentsLocalStorage() {
        var StudentsCheck = localStorage.getItem('Students');
        if ((StudentsCheck !== null) && (StudentsCheck !== "undefined")) {
            var Students = JSON.parse(localStorage.getItem('Students'));
            for (var i = 0; i < Students.length; i++) {
                let newSt = new Person(Students[i].name, Students[i].surname, Number(Students[i].points), Students[i].gradedTasks);
                this.students.push(newSt);
            }

        }
    }

    //Load the Tasks from the local storage of the browser
    TasksLocalStorage() {
        var studentsEl = document.getElementById("llistat");
        var Tasks = JSON.parse(localStorage.getItem('Tasks'));
        if (Tasks !== null) {

            for (var i = 0; i < Tasks.length; i++) {

                let gtask = new GradedTask(Tasks[i].name, Tasks[i].description);
                this.gradedTasks.push(gtask);

                this.students.forEach(function (studentItem) {
                    studentItem.addGradedTask(gtask);
                });
            }
        }

    }

    //Events of the "Create Students Form" and "Create Task Form" function
    initContext() {
        var addStudent = document.getElementById("addStudents");
        addStudent.addEventListener("click", () => {
            this.addStudent();
        });
        var addTask = document.getElementById("addGradedTask");
        addTask.addEventListener("click", () => {
            this.addGradedTasks();
        });
        var contact = document.getElementById("contact");
        contact.addEventListener("click", () => {
            this.contact();
        });
    }

    /** Draw Students rank table in descendent order using points as a criteria */
    getRanking() {
        this.students.sort(function (a, b) {
            return (b.points - a.points);
        });

        var list_students = function (responseText) {

            var studentsEl = document.getElementById("llistat");
            studentsEl.innerHTML = "";
            var headerString = "";

            context.gradedTasks.forEach(function (taskItem) {
                headerString += "<td>" + taskItem.name + "</td>";
            });

            var GRADED_TASK = headerString;
            var repl = eval('`' + responseText + '`');
            studentsEl.innerHTML += repl;   
            if (context.students == ""){
                studentsEl.innerHTML = "No students found";
            } else {
                context.students.forEach(function (studentItem) {
                    let view = studentItem.getHTMLView();
                    studentsEl.appendChild(view);
                });
            }
            
        };
        loadHtml("view/list_students.html", list_students);
    }
    /** Create a new student */
    addStudent() {
        var create_student = function (responseText) {
            var submit = document.getElementById("submit");
            submit.addEventListener("click", () => {
                var stname = document.getElementById("Stname");
                var stsname = document.getElementById("Stsname");
                var points = document.getElementById("Points");

                let newSt = new Person(stname.value, stsname.value, Number(points.value));
                context.students.push(newSt);

                if (context.gradedTasks != "") {
                    context.gradedTasks.forEach(function (gTaskItem) {

                        newSt.addGradedTask(context.gradedTasks);
                    });
                }
                localStorage.setItem("Students", JSON.stringify(context.students));

                context.getRanking();
            });
        };
        loadHtml("view/create_students.html", create_student);
    }

    /** Create a form to create a GradedTask that will be added to every student */
    addGradedTasks() {

        var create_task = function (responseText) {
            var submit = document.getElementById("submit");
            submit.addEventListener("click", () => {
                var tname = document.getElementById("Tname");
                var description = document.getElementById("TDescription");
                let gtask = new GradedTask(tname.value, description.value);
                context.gradedTasks.push(gtask);
                context.students.forEach(function (studentItem) {
                    studentItem.addGradedTask(gtask);
                });
                localStorage.setItem("Tasks", JSON.stringify(context.gradedTasks));
                localStorage.setItem("Students", JSON.stringify(context.students));
                context.getRanking();
            });
        };
        loadHtml("view/create_tasks.html", create_task);
    }

    contact() {
        var contact = function (responseText) {
            var submit = document.getElementById("submit");
            submit.addEventListener("click", () => {
                context.getRanking();
            });
        };
        loadHtml("view/contact.html", contact);
    }
}


export default Context;
export let context = new Context();