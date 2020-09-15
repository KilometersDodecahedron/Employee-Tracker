//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");
const mysql = require("mysql");

//called by addData()
const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the Name of the new Department",
            name: "name"
        }
    ]).then(answer => {

    });
}

//called by addData()
const addEmployee = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the First Name of the Employee",
            name: "firstName",
            default: "John"
        },
        {
            type: "input",
            message: "Enter the Last Name of the Employee",
            name: "lastName", 
            default: "Doe"
        },
        {
            type: "number",
            message: "Enter their Salary",
            name: "salary",
            default: "20000"
        }   
    ]).then(answers => {
        openingMenu.connection.query("INSERT INTO employees SET ?",
        {
            // first_name: answers.firstName,
            // last_name: answers.lastName,

            //TODO create way to access Foreign Keys

        },
        (err, res) => {

        });
        console.log(answers);
        openingMenu.openingMenu();
    });
}

//runs when user chooses to add data
const addData = () => {
    openingMenu.makeNewLine();
    inquirer.prompt([
        {
            type: "list",
            message: "What type of data would you like to add?",
            name: "dataType",
            choices: ["Add a New Employee", "Add a Department", "Add a Role", "Back to Main Menu"]
        }
    ]).then(answer => {
        switch(answer.dataType){
            case "Add a New Employee":
                openingMenu.makeNewLine();
                //TODO finish addEmployee()
                addEmployee();
                break;
            case "Add a Department":
                openingMenu.makeNewLine();
                //TODO
                break;
            case "Add a Role":
                openingMenu.makeNewLine();
                //TODO
                break;
            case "Back to Main Menu":
                openingMenu.openingMenu();
                break;
        }
    });
}

module.exports.addData = addData;