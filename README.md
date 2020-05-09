# Wrauth
Wrauth is a mongoose-based restful api authentication and user management framework, implemented for Mongoose and Mongodb. It comes with sensible defaults and is built for both stateless and stateful authentication using cookies. MongoDB is one key nosql database that is used by many to build a lot off applications,   It is important to understand the focus here; the process of developing a straight-forward user authentication and authorisation system packages for restful apis for mongodb and mongoosejs are sparsely composed or available. This is what Wrauth seeks to achieve. A simple auth strategy based on jwt that works well with [MongoDB](https://www.mongodb.com/) and [Mongoosejs](https://mongoosejs.com/).

    - [**Initialize**](#initialize)
## **Features**
* Highly configurable
* Simple Syntactic and Fun-based Implementation
* Authentication using jwt(Both stateless and using cookies)
* Authorisation by ACL
* Set ACL on route level with validation at the the middleware and mongodb levels
* Update User Account
* Deactivating a user account
* Deleting a user account

## Table of Contents
- [Wrauth](#wrauth)
  - [**Features**](#features)
  - [Table of Contents](#table-of-contents)
    - [Installation](#installation)
    - [Setup](#setup)
    - [Initialize](#initialize)
    - [Activate](#activate)
    - [Guards](#guards)
      - [Guard Types](#guard-types)
        - [ProtectRoute](#protectroute)
        - [ProtectRouteByACL](#protectroutebyacl)
    - [Versioning](#versioning)
    - [License](#license)
    - [Authors](#authors)
        

<!-- toc -->

### Installation
Pull the package from npm.

```
npm install wrauth
```

### Setup

```
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const wrauth = require('./wrauth');
const app = express();
app.use(express.json());
app.use(cookieParser()); 

```

### Initialize
The ```initialize()``` method takes an optional parameter that describes the options for the auth-schema.   
```
const options = {
    roles:['admin','guest'],
    password: {minlength:7}
}

wrauth.initialize(options) //wrauth.initialize()
```
### Activate
The ```activate()``` method, well, activates the Wrauth router. This sets the router in operation.
```
app.use('/auth',wrauth.activate());
```

### Guards
The ```.guard()``` method takes a magic string parameter that represents the type of guard. The guard is a middleware that protects the route or resource.

#### Guard Types
[Currently] There are two main types of guards which are middlewares. For each of the guards you can access the user from the next function as explained below.

##### ProtectRoute
This function protects the route by checking if the user maiking the request is authenticated.  

```
app.get('/show',wrauth.guard('protectRoute'),function(req, res, next){res.json({"data":req.user})})
```

##### ProtectRouteByACL
This function protects the route by checking if the user maiking the request is authenticated and satisfy a specific role or roles passed as a second parameter to the function. Ensure that there are no spaces between the second string parapemter and it must be in the predefined list. The roles that come with Wrauth by default are ```'admin'``` and ```'guest'```     

```
app.get('/show',wrauth.guard('protectRouteByACL','admin,guest'),function(req, res, next){res.json({"data":req.user})```  

### Versioning
We use SemVer for versioning. For the versions available, see the tags on this repository.

### License
This project is licensed under the MIT License

### Authors
* **Raphael Amponsah**


