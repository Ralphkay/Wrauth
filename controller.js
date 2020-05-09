const jwt = require('jsonwebtoken');
const sendmail = require('./helpers/sendmail');
const moment = require('moment');
const {defaultConfigOptions} = require('./config');
const bcrypt = require('bcryptjs');


/**
 * loginUserWithEmail
 * ******************
 * @function
 * This controller log the user in using the email and password
 * @HttpRequest [POST]
 * @param {model} model 
 * @return async function(req,res,next)
 */
const loginUserWithEmail = function(model){
    return async (req,res,next)=>{
        if(!req.body.email || !req.body.password){
            res.status(403).json({message:"Knight! enter thy credentials or face thy Wrauth!"})
        }
    
        const userExist = await model.findOne({email:req.body.email}).select('+password');
        if(!userExist){return res.status(404).json({message:"Hahaha! The Wrauth doesn't know you!"})};
        if(userExist.accountStatus.active == true){userExist.accountStatus.active = false; 
            sendmail("Account Activated!","Welcome back, you have activated your account.",userExist.email)}
        const match =  await bcrypt.compare(req.body.password,userExist.password);
        if(!match){return res.status(404).json({message:"Thy credentials are not in thy testament!"})};
        storeTokenCookie(userExist,res,200)
        next()
    }
}

/**
 * registerUser
 * ******************
 * @function
 * This controller register the user in using: email, password and any other additional parameters you would
 * like to add to the req.body
 * @HttpRequest [POST] 
 * @param {model} model 
 * @return async function(req,res,next)
 */
const registerUser = function(model){
    return async (req, res, next)=>{
    
        await model.create(req.body)
                          .then(user=>{
                            generateEmailConfirmationLink(user, req,res, next);
                            storeTokenCookie(user,res,200)
                              user.save(function (err) {
                                  if (err) {res.status(401).json({message:err.message})}   
                              })
                          }).catch(err=>res.status(401).json({message:err.message}))
                        
                      }
                    next()
}

/**
 * generatePasswordResetLink
 * *************************
 * @function
 * This controller generates a password reset link and sends an email to the registered user
 * the email contains a password restlink, however it has an expiry date of 1 day. You can change the expiry date and email subject head in the config options, using @see wrauth.initialize(options)
 * @param {model} model 
 * @return async function(req,res,next)
 */
const generatePasswordResetLink = function(model){
   return async (req, res,next)=>{

        if(!req.body.email){res.status(405).json({message:"Behold an empty email!"})};
        const user = await model.findOne({"email":req.body.email}).select('+password');
        if(!user){res.status(405).json({message:"The Great Wrauth doesnt know you!"})}
        const resetToken =  user.getResetPasswordToken();
        const resetPasswordUrl = `${req.protocol}://${req.get('host')}/user/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) requested the reset of a password. Please make a PUT request to:${resetPasswordUrl}`;
        sendmail(defaultConfigOptions.emailCredentials.PASSWORD_RESET_SUBJECT,message,user.email);
        user.save();
        res.status(200).json({user});
        next();
    }
}


/**
 * generateEmailConfirmationLink
 * *****************************
 * @function
 * This controller generates an email confirmation link when a user registers or updates his/her email and sends an email to the registered user
 * the email contains 
 * @HttpRequest [NONE]
 * @param {user} model 
 * @param {Object} request 
 * @param {Object} response 
 * @param {func} callback 
 * @return async function(req,res,next)
 */
const generateEmailConfirmationLink = async function(user, req, res, next){
    const confirmationToken = user.getEmailConfirmationLink();
    const confirmationUrl = `${req.protocol}://${req.get('host')}/user/confirmationlink/${confirmationToken}`;
    const message = `You are receiving this email because you (or someone else) sign-up with us. Please make a PUT request to:${confirmationUrl}`;
    sendmail(defaultConfigOptions.emailCredentials.CONFIRMATION_SUBJECT,message,user.email);
    next()
}

/**
 * verifyEmail
 * ***********
 * @function
 * This controller verifies the email of the registered user based on the confirmation token
 * the email contains 
 * @HttpRequest [POST]
 * @param {Object} model
 * @return async function(req,res,next)
 */
const verifyEmail = function(model){
    return async function(req, res, next){
        const reqToken = req.params.token;
        const currentDate = moment();
        const foundUser = await model.findOne({"confirmationToken":reqToken}).select('+password');
        if(!foundUser){return res.status(404).json({message:"Hahaha! The Wrauth doesn't know you!"})}
            // check if time has expired
            if(moment(foundUser.confirmationTokenExpiryDate)-currentDate<0){ 
                {return res.status(404).json({message:"Confirmation Link expired"})}
            }
            foundUser.verified = true;
            foundUser.save(function (err){
                console.log(err)
                res.status(200).json(
            { foundUser,message:"User email verified" }
          )
            })
    }
}

/**
 * resetPassword
 * *************
 * @function
 * The function resets the password of the registered user 
 * @HttpRequest [PUT]
 * 
 * @return async function(req,res,next)
 */
const resetPassword = function(model){
   return async function(req,res,next){

        if(!req.body.password || !req.body.email){
            {return res.status(404).json({message:"Email or Password Required"})}
        }   
        const reqToken = req.params.token;
        const currentDate = moment();
        const foundUser = await model.findOne({"resetPasswordToken":reqToken}).select('+password');
        if(!foundUser){return res.status(404).json({message:"Hahaha! The Wrauth doesn't know you!"})}
            // check if time has expired
            if(moment(foundUser.resetPasswordTokenExpiryDate)-currentDate<0){ 
                {return res.status(404).json({message:"Token expired"})}
            }
           
            foundUser.password = req.body.password.trim();
            foundUser.save(function (err){
                console.log(err)
                res.status(200).json(
            { foundUser,message:"User Password: updated" }
          )
            })
    
    }
}


/**
 * getUserAccount
 * *************
 * @function
 * The function FETCHES the user's account in a json format
 * @HttpRequest [GET]
 * 
 * @return async function(req,res,next) this returns a json data
 */
const getUserAccount = function(model){
   return  async function(req, res, next){
        if (
               req.headers.authorization &&
               req.headers.authorization.startsWith('Bearer')
           ) {
               token = req.headers.authorization.split(' ')[1];
           } else {
               token = req.cookies['token'];
   
           jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
                if (err) {
                    res.status(401).json({
                        message: `Aww Snap, there was something worng: ${err.message}`,
                    });
                }
                model.findById(decoded._id).then(user => {
                    res.status(200).json({ "userAccount": user });
                    next();
                })
                    .catch(err => {
                        res.status(401).json({
                            message: `Not authorised ${err.message}`,
                        });
                    });
            });
       }
   }
}

/**
 * updateUserAccount
 * *************
 * @function
 * The function updates the user's account based on parameters passed through the req.body
 * Remember the req.body values are to be validated against the auth schema
 * @HttpRequest [PUT]
 * 
 * @return async function(req,res,next) this returns a json data
 */
const updateUserAccount = function(model){
   return async function(req, res, next){
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.cookies['token'];
    
       try {
           const decoded =  jwt.verify(token, process.env.JWT_SECRET_KEY);
           let user = await model.findById(decoded._id);
           user = Object.assign(user,req.body);
           if(user.isModified('email')){
               // set verification to false
               user.verified = false;
                // send a confirmation link
                generateEmailConfirmationLink(user,req,res,next)
            //     user.save(function (err) {
            //         if(err){res.status(401).json({message:"Failed to save!"})}
            //   });
           }
           user.save(function (err){
               if(err){
               res.status(403).json({message:"Jogger, there was an error in saving: "+err.message})
            }else{
                res.status(200).json({user})
    
            }
            
        })
       } catch (error) {
           res.status(408).json({message:"There was a fatal error: "+error.message})
       }
    }
    }
}


/**
 * deactivateUserAccount
 * *************
 * @function
 * The function deactivates the user account by setting the active status option to false
 * Remember, you will have to write the implementation of how you would like that to be operated in your application
 * 
 * @HttpRequest [PUT]
 * 
 * @return async function(req,res,next) this returns a json data
 */
const deactivateUserAccount = function(model){
    return async function(req, res, next){
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.cookies['token'];
        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
             if (err) {
                 res.status(401).json({
                     message: `Aww Snap, there was something worng: ${err.message}`,
                 });
             }
             model.findById(decoded._id).then(user => {
                if(user.deletionMechanism.legacyDeletion == false){
                     user.accountStatus.active = false;
                     sendmail("Account Deactivated!","Sometimes it is good to take a break from us, hope to see you soon!",user.email);
                }
                user.save((err)=>{           
                    if (err) {
                        res.status(401).json({
                            message: `Aww Snap, there was something worng: ${err.message}`,
                        });
                    }
                    // res.status(204).json({message:"User deactivated successfully"})
                });
                res.status(200).json({ "userAccount": user });
                 next();
             }).catch(err => {
                     res.status(401).json({
                         message: `Not authorised ${err.message}`,
                     });
                 });
         });
    }
}

}


/**
 * deleteUserAccount
 * *************
 * @function
 * The function deletes the user account by setting the active status option to false
 * Remember, if you set the user.deletionMechanism.legacyDeletion to true in your configuration options in the wrauth.initialize(options), the instance of the model will be actually be deleted. However if it is set to false, then it would operate as a softDelete mechanism
 * With the softDelete mechanism, however the auth user model is not deleted.
 * Remember the req.body values are to be validated against the auth schema
 * @HttpRequest [DELETE]
 * 
 * @return async function(req,res,next) this returns a json data
 */
const deleteUserAccount = function(model){
    return async function(req, res, next){

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.cookies['token'];
    
        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
             if (err) {
                 res.status(401).json({
                     message: `Aww Snap, there was something worng: ${err.message}`,
                 });
             }
             model.findById(decoded._id).then(user => {
                 user.accountStatus.deleted = true;
                 if(user.deletionMechanism.legacyDeletion == true){
                     model.deleteOne({_id:decoded._id});
                     sendmail("Oh no! Account Deleted!","Sorry you had to leave, you have deleted your account. can you please complete this survey to tell us why?",user.email);
                 }
                 user.save((err)=>{
                     err?res.status(401).json({message:"Error in saving"}):res.status(204).json({message:"User deleted successfully"})
                 });
    
    
                 res.status(200).json({ "userAccount": user });
                 next();
             })
                 .catch(err => {
                     res.status(401).json({
                         message: `Not authorised ${err.message}`,
                     });
                 });
         });
    }
    
    }
}

/**
 * storeTokenCookie
 * ****************
 * @function this is a helper function that faciliates the storage of a cookie token
 * @param {Object} user instance of auth user model
 * @param {Object} res response object
 * @param {Number} statuscode response HTTP code
 */
function storeTokenCookie(user,res,statuscode){
    const options = {
        expires: new Date(Date.now()*24*3600*30),
        httpOnly: true
    }
    let token = user.getJwtSignedToken();
    res.status(statuscode).cookie('token',token,options).json({
        success: true,
        data: user
    })
}


/**
 * @function this is a the controller constructor
 * @param {Object} model instance of the auth user model
 * @returns Object
 * 
 * @method verifyEmail
 * @method loginUserWithEmail
 * @method registerUser
 * @method generatePasswordResetLink
 * @method getUserAccount
 * @method getUserAccount
 * @method updateUserAccount
 * @method deactivateUserAccount
 * @method deleteUserAccount
 * 
 */
const authCtrl = (model)=>{
    return {
        verifyEmail:verifyEmail(model),
        ç:loginUserWithEmail(model),
        registerUser:registerUser(model),
        generatePasswordResetLink:generatePasswordResetLink(model),
        resetPassword:resetPassword(model),
        getUserAccount:getUserAccount(model),
        updateUserAccount:updateUserAccount(model),
        deactivateUserAccount:deactivateUserAccount(model),
        deleteUserAccount:deleteUserAccount(model)
    }
}


module.exports = authCtrl;
