const jwt = require('jsonwebtoken');
const guards = {
    protectRouteByACL: function (model, defRoles) {
        return async function (req, res, next) {
            let token = "";
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith('Bearer')
            ) {
                token = req.headers.authorization.split(' ')[1];
            }

            try {
                
                const {token} = req.cookies;
            } catch (error) {
                res.status(401).end(`User may not be logged in: token  not set ${error.message}`)
            }

            try {
                jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
                    if (err) {
                        res.status(401).end(`${err.message}: User may not be logged in.`);
                    }

                    if (decoded) {
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
                                res.status(401).end("You don't have the required permisions")
                            }
                        });
                    } else {
                        res.status(401).end(`Aww Snap, there was something wrong: ${err.message}`)
                    }
                    // next();
                });
            } catch (error) {
                res.status(401).end(error.message)
            }
        }
    },
    protectRoute: function (model) {
        return async function (req, res, next) {
            let token = null;
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith('Bearer')
            ) {
                token = req.headers.authorization.split(' ')[1];
            } else {
                try {
                    token = req.cookies.token;
                } catch (error) {
                    res.end(`User may not be logged in: token  not set ${error.message, error.stack}`)
                }
            }
            try {
                await jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
                    if (err) {
                        res.status(401).end(`User may not be logged in--> Error message: ${err.message, err.stack}:(`);
                    }
                    if (decoded) {
                        model.findById(decoded._id).then(user => {
                                req.user = user;
                                next();
                            })
                            .catch(err => {
                                res.status(401).end(`Not authorised ${err.message, err.stack}`);
                            });
                    } else {
                        res.status(401).end(`Not authorised ${err.message, err.stack}`);
                    }
                });
            } catch (error) {
                res.status(401).end(`Not authoried: ${error.message, error.stack}`)
            }
        };
    }
}
module.exports = guards;