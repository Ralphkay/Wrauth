const authRouter = require('express').Router();
const authCtrl = require('./controller');


/**
 * authRoutes
 * **********
 * @function this function returns the authRouter for Wrauth
 * @routes 
 * 
 * @param {Object} model instance of auth user model
 * @returns authRouter
 */

const authRoutes = function(model){
      authRouter.route('/register').post(authCtrl(model).registerUser);
      authRouter.route('/login').post(authCtrl(model).loginUserWithEmail);
      authRouter.route('/generatepasswordresetlink').post(authCtrl(model).generatePasswordResetLink);
      authRouter.route('/resetpassword/:token').put(authCtrl(model).resetPassword);
      authRouter.route('/verifyemail/:token').put(authCtrl(model).verifyEmail);
      authRouter.route('/useraccount/').get(authCtrl(model).getUserAccount);
      authRouter.route('/updateuseraccount/').put(authCtrl(model).updateUserAccount);
      authRouter.route('/deactivateaccount/').put(authCtrl(model).deactivateUserAccount);
      authRouter.route('/deleteaccount/').delete(authCtrl(model).deleteUserAccount);
      return authRouter;
}

module.exports = authRoutes;