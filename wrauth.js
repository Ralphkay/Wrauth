//ts
const {
    defaultConfigOptions
} = require('./config');
const mongoose = require('mongoose');
const routeMiddlewares = require('./guards')
const authRoutes = require('./routes');
const merge = require('merge-deep');
const cookieParser = require('cookie-parser')
/**
 * Wrauth
 * ******
 * @object
 * This is the main waruth object; its properties are;
 * @private plodel - this is private object, that get sets to become the model
 * @private op - this is a private object that get sets to the configurations/options by you 
 * @method initialize - this method initializes the Wrauth (params [options=""])
 * @method activate - this activates the wrauth router 
 * @method guard - this activates the auth routes (params [guardName,roles])
 * @example
 const wrauth = require('./wrauth');
 const options = {
    roles:['admin','guest'],
    password: {minlength:7}
}
wrauth.initialize()
app.use('/auth',wrauth.activate());
app.get('/show',wrauth.guard('protectRoute'),function(req, res, next){res.json({"data":req.user})})
app.get('/home',wrauth.guard('protectRouteByACL','admin,guest'),function(req, res, next){res.json({"data":req.user})})
 * 
 */
const wrauth = {
    plodel: {},
    op: {},
    /**
     * Initializes Wrauth
     * ******************
     * @function
     * This function initilizes the authschema
     * and compiles the authmodel based on the mongoose model and schema
     * 
     * @example
     * const options = {password:{minlength:12}}
     * wrauth.initialize(options) //options parameter is optional
     * 
     * @param {Object} options
     * @returns {Model} model
     */
    initialize: function (options = {}) {
        options = merge(defaultConfigOptions, options)
        this.op = options;
        const AuthUserSchema = require('./AuthUserSchema');
        const AuthModel = mongoose.model('AuthUser', AuthUserSchema(options));
        return this.plodel = AuthModel;
    },
    /**
     * The Wrauth Router Activator
     * ***********************
     * @function
     * This function activates the router. This auth model is bind to the router
     * so that you can easily access the auth user model.
     * @returns {Router} WrauthRouter - the Wrauth Router
     */
    activate: function () {
        return authRoutes(this.plodel)
    },
    /**
     * The Wrauth Guard 
     * ****************
     * @function
     * This function returns a guard middleware depending on the gaurd called.
     * e.g. call a guard by wrauth.guard('protectByRoute')
     * call using any one of the following magic strings 
     * ****************************************************
     * @example
     *  'protectByRoute' => wrauth.guard('protectByRoute')
     *  'protectRouteByACL'=>wrauth.guard('protectRouteByACL','admin,guest')
     *
     * NB:Remember that if you use 'protectRouteByACL', the roles parameter becomes required. 
     * By default Wrauth comes with 
     * @default roles = ['admin','guest']
     * 
     * @param {string} guardName - The name of the guard for the route
     * @param {string} [roles=""] - a value or comma separated string list of roles in the predefined configuration list. 
     * 
     * Avoid spaces or any other special character apart from comma
     * 
     * The return value is a 
     * @returns Promise<void> - this is either the protectRoute or the protectRouteByACL which is dependednt on the [guardName] given, however the auth user model is made available to the next middleware for consumption.
     * 
     * 
     */
    guard: function (guardName, roles) {
        switch (guardName) {
            case 'protectRoute':
                return routeMiddlewares.protectRoute(this.plodel, this.op);
            case 'protectRouteByACL':
                const defRoles = roles.split(',');
                let isValidRole = defRoles.every((val) => {
                    return this.op.roles.includes(val);
                });
                if (!isValidRole) {
                    throw new Error("ACL middleware second parameter(role) not valid/not in predefined list");
                }
                return routeMiddlewares.protectRouteByACL(this.plodel, defRoles, this.op);
            default:
                return routeMiddlewares.protectRoute(this.plodel);
        }
    }
}
module.exports = wrauth;