const jwt = require('jsonwebtoken');



const guards = {
        protectRouteByACL:function(model,options) {
            // const args = arguments;
          
              return function(roles){
                return async function(req, res, next){
                    const arrayed = roles.split(',');

                    let isValidRole = arrayed.every((val)=>{
                        return options.roles.includes(val);
                    })

                     if(!isValidRole){
                         console.log(options.roles,arrayed)
                          res.status(403).json({message:"ACL middleware parameter not valid/not in the list"});
                     }
                          if (
                              req.headers.authorization &&
                              req.headers.authorization.startsWith('Bearer')
                          ) {
                              token = req.headers.authorization.split(' ')[1];
                          } else {
                              token = req.cookies['token'];
              
                            jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decoded) {
                                  if (err) {
                                  res.status(401).json({
                                      message: `Aww Snap, there was something worng: ${err.message}`,
                                  });
                              }
                         
                            model.findById(decoded._id,function(err, user){
                                  if(err){res.status(404).json({message:`${err}`})}
                                  const {role} = user;
                                  if(!(arrayed.includes(role))){res.status(403).json({message:"You don't have the required permisions"})}
                                  req.user = user;
                                  next();   
                              });
                          });
                  }
                  }
              }
              next()
          },
        protectRoute:function(model){
            return async function(req, res, next) {
                if (
                    req.headers.authorization &&
                    req.headers.authorization.startsWith('Bearer')
                ) {
                    token = req.headers.authorization.split(' ')[1];
                } else if(req.cookies['token']!=""){
                    token = req.cookies['token'];
        
                await jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decoded) {
                    if (err) {
                    res.status(401).json({
                        message: `Aww Snap, there was something wrong: ${err.message}`,
                    });
                    }
                   
                    model.findById(decoded._id).then(user => {
                        req.user = user;
                        next();
                    })
                    .catch(err => {
                        res.status(401).json({
                        message: `Not authorised ${err.message}`,
                        });
                    });
                });
            }else{
                res.status(403).json(
    { message:"You are not allowed here." }
  )
            }
        };
        }
}

module.exports = guards;