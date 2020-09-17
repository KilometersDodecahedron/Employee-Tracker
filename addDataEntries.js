//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");
const mysql = require("mysql");

const addRole = () => {
    //stores the name and ID of the departments
    let departmentList = [];
    let departmentId = [];

    openingMenu.connection.query("SELECT * FROM departments", (err, res) => {
        if(err) throw err;

        //adds the data from the response to the arrays for functions 
        res.forEach(element => {
            departmentList.push(element.name);
            departmentId.push(element.id);
        });

        inquirer.prompt([
            {
                //name
                type: "input",
                message: "Enter the Name of the role",
                name: "title"
            },
            {
                //salary
                type: "number",
                message: "Enter the Salary of the role",
                name: "salary"
            },
            {
                //department
                type: "list",
                message: "What department is the Role in?",
                name: "department",
                choices: departmentList
            }
        ]).then(answers => {
            //gets the id of the deparment to put into the table as a Foreign Key
            let id = departmentId[departmentList.indexOf(answers.department)];
            
            let newRole = {
                title: answers.title,
                salary: answers.salary,
                department_id: id
            };
            
            openingMenu.connection.query("INSERT INTO roles SET ?", newRole,
            (err, res) => {
                //TODO ask if they want to add more
                if(err) throw err;
                addData();
            }) 
        })
    });
}

//called by addDepartment() upon completion
const departmentFinished = () => {
    openingMenu.makeNewLine();
    //asks if they want to add another department, a different data type, or go back to the main menu
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do now?",
            name: "decision",
            choices: ["Add another Department", "Add a different Data Type", "Return to the Main Menu"]
        }
        ]).then(answer => {
            openingMenu.makeNewLine();
            switch(answer.decision){
                case "Add another Department":
                    addDepartment();
                    break;
                case "Add a different Data Type":
                    addData();
                    break;
                case "Return to the Main Menu":
                    openingMenu.openingMenu();
                    break;
            }
        });
}

//called by addData()
const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the Name of the new Department",
            name: "name"
        }
    ]).then(answer => {
        if(answer.name.length > 0){
            openingMenu.connection.query("INSERT INTO departments SET ?",
            {
                name: answer.name
            },
            (err, res) => {
                if(err) throw err;
                console.log("New Department Created!");
                departmentFinished();
            });
        }else{
            console.log("No name detected");
            departmentFinished();
        }
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
        //pick which data type they want to enter
        switch(answer.dataType){
            case "Add a New Employee":
                openingMenu.makeNewLine();
                //TODO finish addEmployee()
                addEmployee();
                break;
            case "Add a Department":
                openingMenu.makeNewLine();
                addDepartment();
                break;
            case "Add a Role":
                openingMenu.makeNewLine();
                //TODO finish addRole()
                addRole();
                break;
            case "Back to Main Menu":
                openingMenu.openingMenu();
                break;
        }
    });
}

module.exports.addData = addData;