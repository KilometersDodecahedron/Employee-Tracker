//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");

//run by index.js
const viewData = () => {
    openingMenu.makeNewLine();
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to examine?",
            name: "answer",
            choices: ["Employees", "Roles", "Departments", "Back to Main Menu"]
        }
    ]).then(answer => {
        switch(answer.answer){
            case "Employees":
                //TODO write
                openingMenu.makeNewLine();
                break;
            case "Roles":
                //TODO finish
                viewRoles();
                openingMenu.makeNewLine();
                break;
            case "Departments":
                openingMenu.makeNewLine();
                viewDepartments();
                break;
            case "Back to Main Menu":
                openingMenu.openingMenu();
                break;
        }
    });
}

const viewDepartments = () => {
    //start by getting list of roles
    openingMenu.connection.query("SELECT * FROM roles", (err, roles) => {
        if(err) throw err;
        //then gets the departments
        openingMenu.connection.query("SELECT * FROM departments", (err, departments) => {
            if(err) throw err;
            //display each deparment, along with their roles
            departments.forEach(element => {
                let relevantRoles = roles.map(object =>{
                    if(object.department_id == element.id){
                        return object.title;
                    };
                });
                relevantRoles = relevantRoles.join(" ");
                if(relevantRoles == " "){
                    relevantRoles = "none";
                }
                console.log(element.name + ` (Roles in Department: ${relevantRoles})`);
            });
            viewData();
        });
    });  
}

//practicing using Promises. Use "*" to get all the columns, use an array to get multiple
const getColumnFromTable = (column, table) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT ${column} FROM ${table}`;
        openingMenu.connection.query(query, (err, data) => {
            if(err) throw err;
            resolve(data);
        });
    });
}

const viewRoles = () => {
    getColumnFromTable("*", "departments").then(data => {
        var depList = [];
        var depIds = [];
        //stores list of departments for inquirer
        data.forEach(object => {
            depList.push(object.name);
            depIds.push(object.id);
        });

        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to see?",
                name: "search",
                choices: ["All Roles", "Only Roles With A Deparment", "Search Roles By Department"]
            },
            {
                type: "list",
                message: "Which Department?",
                name: "department",
                choices: depList,
                when: question => { return question.search === "Search Roles By Department"; }
            }
        ]).then(answers => {
            switch(answers.search){
                case "All Roles":
                    openingMenu.connection.query("SELECT title FROM roles", (err, data) => {
                        data.forEach(object => {
                            console.log(object.title);
                        });
                        viewData();
                    });
                    break;
                case "Search Roles By Department":
                    let idOfSearch = depIds[depList.indexOf(answers.department)];
                    openingMenu.connection.query("SELECT title FROM roles WHERE department_id = ?", [idOfSearch], (err, data) => {
                        data.forEach(object => {
                            console.log(object.title);
                        });
                        viewData();
                    });
                    break;
                case "Only Roles With A Deparment":
                    openingMenu.connection.query("SELECT title FROM roles WHERE department_id > 0", (err, data) => {
                        data.forEach(object => {
                            console.log(object.title);
                        });
                        viewData();
                    });
                    break;
            }
        });
    }) 
}

module.exports.viewData = viewData;