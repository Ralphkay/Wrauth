const dotenv = require('dotenv');
dotenv.config()

/**
 * Default Configuration Options
 * @object
 * These are sensible defaults that comes with Wrauth
 * You can override these default by passing a new options
 * value to the wrauth.initialize() function.
 */
let defaultConfigOptions = {
    SMTP:{
        USER:"4820d40b5fbba1",
        PASSWORD:"45a3ae10ef6b24",
        HOST:"smtp.mailtrap.io",
        PORT:2525,
    },
    emailCredentials:{
        SENDER:"Man of Wrauth",
        SENDER_ADDRESS:"man@wrauth.com",
        SENDER_PASSWORD:"secret",
        PASSWORD_RESET_SUBJECT:"Password Reset Link", //default
        CONFIRMATION_SUBJECT:"Email Confirmation"
    },
    authSecretKeys:{
        JWT_SECRET_KEY:"14455936d183f3ed10821028b320a648a2a0a70ebc1cdf1cccc1910611db483b",
        JWT_EXPIRY_DATE:"30d"
    },

    roles:['admin', 'guest','buyer','seller','courier'],

    schemaBooleans:{
        useEmail:true, //default
        useUsername:false, //default sets username to not required
        useRoles:false
    },
    username:{
        minlength:4,
        maxlength:8
    },
    password:{
        minlength:7
    },
    profile_photo:{
        useProfilePhoto: false //default
    },
    account_status:{
        deleteState:false, //default
        activeState:false
    },
    deletionMechanism:{
        softDeletion:true, //default
        legacyDeletion:false //default
    }
}

module.exports = {defaultConfigOptions}
