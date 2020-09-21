//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");

const viewData = () => {
    openingMenu.makeNewLine();
    console.log("You accessed viewDataEntries.js");
    openingMenu.makeNewLine();
    openingMenu.openingMenu();
}

module.exports.viewData = viewData;