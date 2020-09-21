//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");
const mysql = require("mysql");

//called by addData()
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
                type: "confirm",
                message: "Is this role part of an official Deparment?",
                name: "hasDepartment",
                when: () => {return departmentList.length > 0;}
            },
            {
                //department
                type: "list",
                message: "What Department is the Role in?",
                name: "department",
                choices: departmentList,
                when: questions => {
                    return questions.hasDepartment;
                }
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
                console.log(`The ${answers.title} Role (Salary: ${answers.salary}, Department: ${answers.department}) has been Added`);
                dataEntryFinished("role");
            }) 
        })
    });
}

//called by data entry functions upon completion
//input tells it what type of data was entered
const dataEntryFinished = (typeOfData) => {
    openingMenu.makeNewLine();
    //asks if they want to add another department, a different data type, or go back to the main menu
    switch(typeOfData) {
        case "department":
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
            break;
        case "role":
            inquirer.prompt([
                {
                    type: "list",
                    message: "What would you like to do now?",
                    name: "decision",
                    choices: ["Add another Role", "Add a different Data Type", "Return to the Main Menu"]
                }
                ]).then(answer => {
                    openingMenu.makeNewLine();
                    switch(answer.decision){
                        case "Add another Role":
                            addRole();
                            break;
                        case "Add a different Data Type":
                            addData();
                            break;
                        case "Return to the Main Menu":
                            openingMenu.openingMenu();
                            break;
                    }
                });
            break;
        case "employee":
            inquirer.prompt([
                {
                    type: "list",
                    message: "What would you like to do now?",
                    name: "decision",
                    choices: ["Add another Employee", "Add a different Data Type", "Return to the Main Menu"]
                }
                ]).then(answer => {
                    openingMenu.makeNewLine();
                    switch(answer.decision){
                        case "Add another Employee":
                            addEmployee();
                            break;
                        case "Add a different Data Type":
                            addData();
                            break;
                        case "Return to the Main Menu":
                            openingMenu.openingMenu();
                            break;
                    }
                });
            break;
    }
 
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
                console.log(`The ${answer.name} Department has been Created!`);
                dataEntryFinished("department");
            });
        }else{
            console.log("No name detected");
            dataEntryFinished("department");
        }
    });
}

//get departments and employees for addEmployee
const returnDataForEmployees = () => {
    return new Promise((resolve, reject) => {
        openingMenu.connection.query("SELECT * FROM roles", (err, roles) => {
            if (err) throw err;
            openingMenu.connection.query("SELECT * FROM employees", (err, employees) => {
                if (err) throw err;
                let dataHolder = { roleData: roles, employeeData: employees};
                resolve(dataHolder);
            });
        });
    }); 
}

//called by addData()
const addEmployee = () => {
    //gets list of employees to asign mangers
    let employeeList = [];
    let employeeIds = [];

    //gets list of roles to assign
    let roleList = [];
    let roleId = [];

    returnDataForEmployees().then(data => {
        //puts the info from the call into the arrays for inquirer prompts
        employeeList = data.employeeData.map(object => {
            return (object.first_name + " " + object.last_name);
        });

        employeeIds = data.employeeData.map(object => {
            return object.id;
        });

        roleList = data.roleData.map(object => {
            return object.title;
        });

        roleId = data.roleData.map(object => {
            return object.id;
        });

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
                //ask if role
                type: "confirm",
                message: "Does this employee have an official Role?",
                name: "hasRole",
                when: () => {return roleList.length > 0}
            },
            {
                //give role if asked
                type: "list",
                message: "What role do they have?",
                name: "role",
                choices: roleList,
                when: questions => {
                    return questions.hasRole;
                }
            },
            {
                //ask if manager
                type: "confirm",
                message: "Does this employee have a Manager?",
                name: "hasManager",
                when: () => {return employeeList.length > 0}
            },
            {
                //give manager if asked
                type: "list",
                message: "Who is their manager?",
                name: "manager",
                choices: employeeList,
                when: questions => {
                    return questions.hasManager;
                }
            }
        ]).then(answers => {
            //set defaults to 'null' in case they didn't pick something
            var idOfManager = null;
            var idOfRole = null;

            //sets the variables to the chosen values, if they were selected
            if(answers.hasManager){
                idOfManager = employeeIds[employeeList.indexOf(answers.manager)];
            }
            if(answers.hasRole){
                idOfRole = roleId[roleList.indexOf(answers.role)];
            } 

            openingMenu.connection.query("INSERT INTO employees SET ?",
            {
                first_name: answers.firstName,
                last_name: answers.lastName,
                role_id: idOfRole,
                manager_id: idOfManager
            },
            (err, res) => {
                if(err) throw err;
                console.log(`${answers.firstName + " " + answers.lastName} (Role: ${answers.role}, Manager: ${answers.manager}) is now an Employee!`);
                dataEntryFinished("employee");
            });
        });
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