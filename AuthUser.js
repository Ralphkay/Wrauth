/**
 * 
 * AuthUser Model
 * ===========================================
 * This is the authentication user model based
 * on the Auth User Schema
 * -------------------------------------------
 * 
 * 
 * 
 */
const mongoose = require('mongoose');
const authmodel = function(modelName,modelSchema){
    return mongoose.model(modelName, modelSchema)
}

module.exports = authmodel;