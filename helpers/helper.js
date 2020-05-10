
module.exports = {
    responseStatusMessage: (res, statuscode,success=false, data=null,message='')=>{
       res.status(statuscode).json({
            'success':success,
            'data':data,
            'message':message
        })
    }
    
}