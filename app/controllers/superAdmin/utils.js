const School = require("../../models/School");
const User = require("../../models/User");
const Income = require("../../models/Income");
const Expense = require("../../models/Expense");
const Supplier = require("../../models/Supplier");
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


module.exports={
    School, 
    User,
    Income,
    Expense,
    Supplier,
    strongPasswordRegex
}