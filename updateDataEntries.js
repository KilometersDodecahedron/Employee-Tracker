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
                break;
            case "Deparments":
                openingMenu.makeNewLine();
                //TODO
                updateDepartment();
                break;
            case "Back to Main Menu":
                openingMenu.openingMenu();
                break;
        }
    });
}

const askHowToSearchEmployees = () => {
    //inquirer.prompt
}

const updateEmployees = () => {

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