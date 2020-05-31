const jwt = require('jsonwebtoken');
const guards = {
    protectRouteByACL: function (model, defRoles, options = {}) {
        const JWT_SECRET_KEY = options.authSecrets.JWT_SECRET_KEY;

        return async function (req, res, next) {
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith('Bearer')
            ) {
                token = req.headers.authorization.split(' ')[1];
            }

            try {
                const {
                    token
                } = req.cookies;
            } catch (error) {
                return res.status(401).end(`User may not be logged in: token  not set ${error.message}`)
            }

            try {
                jwt.verify(token, JWT_SECRET_KEY, function (err, decoded) {
                    if (err) {
                        return res.status(401).end(`${err.message}: User may not be logged in.`);
                    }

                    if (!decoded) {
                        return res.status(401).end(`Aww Snap, there was something wrong: ${err.message}`)
                    }
                    model.findById(decoded._id, function (err, user) {
                        if (err) {
                            res.status(404).json({
                                message: `${err}`
                            })
                        }
                        const {
                            role
                        } = user;

                        if ((defRoles.includes(role))) {
                            req.user = user;
                            next()
                        } else {
                            return res.status(401).end("You don't have the required permisions")
                        }
                    });

                    // next();
                });
            } catch (error) {
                return res.status(401).end(error.message)
            }
        }
    },
    protectRoute: function (model, options = {}) {
        const JWT_SECRET_KEY = options.authSecrets.JWT_SECRET_KEY;
        return async function (req, res, next) {
            let token = null;
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith('Bearer')
            ) {
                token = req.headers.authorization.split(' ')[1];
            }
            try {

                token = req.cookies.token;
            } catch (error) {
                return res.end(`User may not be logged in: token  not set ${error.message, error.stack}`)
            }

            try {

                await jwt.verify(token, JWT_SECRET_KEY, function (err, decoded) {
                    if (err) {
                        return res.status(401).end(`User may not be logged in--> Error message: ${err.message}:(`);
                    }

                    if (!decoded) {
                        return res.status(401).end(`Aww Snap, there was something wrong: ${err.message}`)

                    }
                    model.findById(decoded._id, function (err, user) {
                        if (err) {
                            return res.status(404).json({
                                message: `${err}`
                            })
                        }
                        req.user = user;
                        next();

                    })

                })
            } catch (error) {
                return res.status(401).end(`Not authoried: ${error.message, error.stack}`)
            }
        };
    }
}
module.exports = guards;