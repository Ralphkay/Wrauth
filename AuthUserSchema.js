const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const moment = require('moment')
const uniqueValidator = require('mongoose-unique-validator');
/**
 * AuthUserSchema
 * ******************
 * 
 * This define the schema representation 
 * of the AuthUser model
 */
const AuthUserSchema = function (options = {}) {
    // if(options instanceof Object && options !={}){
    //     def = Object.assign(defaultConfigOptions,options)
    // }
    const authschem = new mongoose.Schema({
        email: {
            type: String,
            required: options.schemaBooleans.useEmail,
            unique: true
        },
        firstName: {
            type: String,
            required: options.schemaBooleans.useFirstName
        },
        otherName: {
            type: String,
            required: options.schemaBooleans.useOtherName
        },
        lastName: {
            type: String,
            required: options.schemaBooleans.useLastName
        },
        username: {
            type: String,
            unique: true,
            minlength: options.username.minlength,
            maxlength: options.username.maxlength,
            required: options.schemaBooleans.useUsername
        },
        role: {
            type: String,
            enum: options.roles,
            required: options.schemaBooleans.useRoles
        },
        verified: {
            type: Boolean,
            default: false
        },
        accountStatus: {
            deleted: {
                type: Boolean,
                required: true,
                default: false,
            },
            active: {
                type: Boolean,
                required: true,
                default: true,
            },
        },
        deletionMechanism: {
            softDeletion: {
                type: Boolean,
                required: true,
                default: options.deletionMechanism.softDeletion
            },
            legacyDeletion: {
                type: Boolean,
                required: true,
                default: options.deletionMechanism.legacyDeletion
            }
        },
        password: {
            type: String,
            required: true,
            select: false,
            minlength: options.password.minlength
        },
        resetPasswordToken: {
            type: String,
            required: false
        },
        resetPasswordTokenExpiryDate: {
            type: Date,
            required: false
        },
        confirmationToken: {
            type: String,
            required: false
        },
        confirmationTokenExpiryDate: {
            type: Date,
            required: false
        },
        profile_photo: {
            type: String,
            required: options.useProfilePhoto
        }
    });
    authschem.pre('save', async function (next) {
        // only hash the password if it has been modified (or is new)
        if (!this.isModified('password')) return next();
        const salt = await bcrypt.genSalt(11);
        const hashedPassword = await bcrypt.hashSync(this.password, salt);
        return this.password = hashedPassword;
    })

    authschem.methods.getJwtSignedToken = function (next) {
        return jwt.sign({
            _id: this._id
        }, options.authSecretKeys.JWT_SECRET_KEY, {
            expiresIn: options.authSecretKeys.JWT_EXPIRY_DATE
        });
    }
    authschem.methods.getResetPasswordToken = function (next) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        // set expire
        this.resetPasswordTokenExpiryDate = moment().add(options.emailCredentials.RESET_PASSWORD_TOKEN_EXPIRY_DATE, options.emailCredentials.RESET_PASSWORD_TOKEN_EXPIRY_DATE_TYPE);
        return resetToken;
    }
    authschem.methods.getEmailConfirmationToken = function (next) {
        const token = crypto.randomBytes(32).toString('hex');
        this.confirmationToken = crypto.createHash('sha256').update(token).digest('hex');
        this.confirmationTokenExpiryDate = moment().add(options.emailCredentials.CONFIRMATION_TOKEN_EXPIRY_DATE, options.emailCredentials.CONFIRMATION_TOKEN_EXPIRY_DATE_TYPE);
        return token;
    }
    authschem.plugin(uniqueValidator);
    return authschem;
}
module.exports = AuthUserSchema;