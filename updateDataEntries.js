//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");

//accessed by index.js
const updateData = () => {
    openingMenu.makeNewLine();
    inquirer.prompt([
        {
            type: "list",
            message: "What type of data would you like to Update?",
            name: "dataType",
            choices: ["Employees", "Roles", "Deparments", "Back to Main Menu"]
        }
    ]).then(answer => {
        //pick which data type they want to modify
        switch(answer.dataType){
            case "Employees":
                openingMenu.makeNewLine();
                //TODO
                break;
            case "Roles":
                openingMenu.makeNewLine();
                //TODO
                updateRoles();
                break;
            case "Deparments":
                openingMenu.makeNewLine();
                updateDepartment();
                break;
            case "Back to Main Menu":
                openingMenu.openingMenu();
                break;
        }
    });
}

//called by updateRoles
const preformTheRoleUpdate = (rolesObject, query, callback) => {
    var roleTitleArray = [];

    //set array for inquirer
    rolesObject.forEach(object => {
        roleTitleArray.push(object.title);
    });

    inquirer.prompt([
        //ask which role
        {
            type: "list",
            message: "Select the Role",
            name: "role",
            choices: roleTitleArray
        },
        //inout a new name if renaming
        {
            type: "input",
            messsage: "Enter the New Title for the Role",
            name: "newTitle",
            when: () => {return query == "UPDATE roles SET title = ? WHERE title = ?"}
        }
    ]).then(answers => {
        //true if changing the title rather than deleting the role
        var checkNewTitle = answers.newTitle != undefined;
        var sqlEntryArray = [];

        //makes sure the correct number of entries are queried
        if(checkNewTitle){
            sqlEntryArray.push(answers.newTitle);
        }

        sqlEntryArray.push(answers.role);

        openingMenu.connection.query(query, sqlEntryArray, (err) => {
            if (err) throw err;
            openingMenu.makeNewLine();
            if(checkNewTitle){
                console.log(`The ${answers.role} Role is now called the ${answers.newTitle} Role`);
            }else{
                console.log(`The ${answers.role} Role has been Deleted`);
            }
            //runs at the end to continue function
            callback();
        })
    })
}

const askHowToSearchEmployees = () => {
    //inquirer.prompt
}

const updateEmployees = () => {
    // inquirer.prompt([

    // ])
}

const updateRoles = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "Any roles in particular?",
            name: "search",
            choices: ["No, show me All Roles", "Search Roles by Salary", "Search Roles by Department"]
        },
        {
            type: "list",
            message: "How would you like to search by Salary?",
            name: "salarySearch",
            choices: ["Salaries ABOVE a threshold", "Salaries BELOW a threshold", "Salaries BETWEEN two values"],
            when: questions => {
                return (questions.search == "Search Roles by Salary");
            }
        },
        {
            type: "number",
            message: "Entery Salary Threshold",
            name: "threshold",
            when: questions => {
                return (questions.salarySearch == "Salaries ABOVE a threshold" || questions.salarySearch == "Salaries BELOW a threshold");
            }
        },
        {
            type: "number",
            message: "Entery Minimum Salary",
            name: "min",
            when: questions => {
                return (questions.salarySearch == "Salaries BETWEEN two values");
            }
        },
        {
            type: "number",
            message: "Entery Maximum Salary",
            name: "max",
            when: questions => {
                return (questions.salarySearch == "Salaries BETWEEN two values");
            }
        },
        {
            type: "list",
            message: "How would you like to Update Roles?",
            name: "decision",
            choices: ["Rename Role", "Delete Role", "Update a Different Data Type"]
        }
    ]).then(answers => {
        if(answers.decision == "Update a Different Data Type"){
            updateData();
        }else{
            //builds the query to fetch the data before proceeding
            constructQuery(answers).then((response) => {
                var theQuery = response;

                //set the action that it will preform
                var updateQuery = ``;

                if(answers.decision == "Rename Role"){
                    updateQuery = `UPDATE roles SET title = ? WHERE title = ?`;
                }else if (answers.decision == "Delete Role"){
                    updateQuery = 'DELETE FROM roles WHERE title = ?';
                }

                openingMenu.makeNewLine();
                
                //manages the query and update using preformTheRoleUpdate()
                openingMenu.connection.query(theQuery, (err, data) => {
                    preformTheRoleUpdate(data, updateQuery, () => {
                        updateData();
                    });
                });
            });
        }
    });
}

//called by updateRoles() to make the database query
const constructQuery = (answers) => {
    return new Promise((resolve, reject) => {
        //this will be returned to let it know what data to return
        let returnQuery = "SELECT * FROM roles";
        //start based on search type
        switch(answers.search){
            case "No, show me All Roles":
                //get list of all roles
                resolve(returnQuery);
                break;
            case "Search Roles by Salary":
                if(answers.salarySearch == "Salaries ABOVE a threshold"){
                    returnQuery += ` WHERE salary >= ${answers.threshold}`;
                    resolve(returnQuery);
                }else if(answers.salarySearch == "Salaries BELOW a threshold"){
                    returnQuery += ` WHERE salary <= ${answers.threshold}`;
                    resolve(returnQuery);
                }else{
                    returnQuery += ` WHERE salary >= ${answers.min} AND salary <= ${answers.max}`;
                    resolve(returnQuery);
                }
                break;
            case "Search Roles by Department":
                //TODO
                openingMenu.connection.query("SELECT * FROM departments", (err, data) => {
                    var depIds = [];
                    var depNames = [];

                    data.forEach(object => {
                        depNames.push(object.name);
                        depIds.push(object.id);
                    })

                    inquirer.prompt([
                        //ask wi=hich depatment
                        {
                            type: "list",
                            message: "Which Deparment would you like to see the Roles of?",
                            name: "department",
                            choices: depNames
                        }
                    ]).then(answer => {
                        returnQuery += ` WHERE department_id = ${depIds[depNames.indexOf(answer.department)]}`;
                        resolve(returnQuery);
                    });
                });
                break;
        }
    });
}

const updateDepartment = () => {
    openingMenu.connection.query("SELECT * FROM departments", (err, data) => {
        let departmentNames = [];
        let departmentIds = [];

        data.forEach(element => {
            departmentNames.push(element.name);
            departmentIds.push(element.id);
        });

        inquirer.prompt([
            {
                type: "list",
                message: "How would you like to Update Departments?",
                name: "decision",
                choices: ["Rename Department", "Delete Department", "Update a Different Data Type"]
            },
            {
                type: "list",
                message: "Select the Department",
                name: "department",
                choices: departmentNames,
                when: questions => {
                    return (questions.decision != "Update a Different Data Type")
                }
            },
            {
                type: "input",
                message: "Enter the New Name of the Department",
                name: "newName",
                when: questions => {
                    return (questions.decision == "Rename Department")
                }
            }
        ]).then(answers => {
            openingMenu.makeNewLine();
            switch(answers.decision){
                case "Rename Department":
                    openingMenu.makeNewLine();
                    openingMenu.connection.query("UPDATE departments SET name = ? WHERE name = ?", [answers.newName, answers.department], (err, data) => {
                        if(err) throw err;
                        console.log(`The ${answers.department} Department has been renamed the ${answers.newName} Department`);
                        dataUpdateFinished("department");
                    });
                    break;
                case "Delete Department":
                    openingMenu.makeNewLine();
                    openingMenu.connection.query("DELETE FROM departments WHERE name = ?", [answers.department], (err, data) => {
                        if(err) throw err;
                        console.log(`The ${answers.department} Department has been Deleted`);
                        dataUpdateFinished("department");
                    });
                    break;
                case "Update a Different Data Type":
                    updateData();
                    break;
            }
        });
    });
}

//called after update
const dataUpdateFinished = (typeOfData) => {
    openingMenu.makeNewLine();
    //asks if they want to Update another department, a different data type, or go back to the main menu
    switch(typeOfData) {
        case "department":
            inquirer.prompt([
                {
                    type: "list",
                    message: "What would you like to do now?",
                    name: "decision",
                    choices: ["Update another Department", "Update a different Data Type", "Return to the Main Menu"]
                }
                ]).then(answer => {
                    openingMenu.makeNewLine();
                    switch(answer.decision){
                        case "Update another Department":
                            updateDepartment();
                            break;
                        case "Update a different Data Type":
                            updateData();
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
                    choices: ["Update another Role", "Update a different Data Type", "Return to the Main Menu"]
                }
                ]).then(answer => {
                    openingMenu.makeNewLine();
                    switch(answer.decision){
                        case "Update another Role":
                            addRole();
                            break;
                        case "Update a different Data Type":
                            updateData();
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
                    choices: ["Update another Employee", "Update a different Data Type", "Return to the Main Menu"]
                }
                ]).then(answer => {
                    openingMenu.makeNewLine();
                    switch(answer.decision){
                        case "Update another Employee":
                            addEmployee();
                            break;
                        case "Update a different Data Type":
                            updateData();
                            break;
                        case "Return to the Main Menu":
                            openingMenu.openingMenu();
                            break;
                    }
                });
            break;
    }
}

module.exports.updateData = updateData;