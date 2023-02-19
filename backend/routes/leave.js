const express = require("express");
const router = express.Router();
const Nurse = require('../models/nurse.model');
const Realtime = require('../models/realtime.model');

module.exports = function(socket){
    router.route("/add").post(function(req,res){
        if(req.role == 0){//user
            Realtime.create({
                request:req.originalUrl,
                level:1,
                status:1,
                data:req.body,
            },function(err,data){
                if(!err){
                    socket.emit("request",data);
                    socket.broadcast.emit("request",data);
                    res.send({state:"success"});
                }
            });
        }else if(req.role == 1){//approver
            if(req.body.status == 2){//approve
                Realtime.findOneAndUpdate({_id:req.body._id},{status:2},function(err,data){
                    if(!err){
                        let today = new Date();
                        let leave_id = today.getFullYear()*(today.getMonth()+today.getDate()+today.getDay())*(today.getHours()+today.getMinutes()+today.getSeconds()+today.getMilliseconds());
                        Nurse.findOneAndUpdate({_id:req.body.data.nurse_id},
                            {$push:{"leave":{leave_id:leave_id,from:req.body.data.from,to:req.body.data.to, type: req.body.data.type}}}
                        ).then(function(result){
                            Nurse.find({},function(err,nurses){
                                socket.emit("approve",{...req.body,NurseDatas:nurses});
                                socket.broadcast.emit("approve",{...req.body,NurseDatas:nurses});
                                res.send({state:"success"});
                            });
                        });
                    }
                });
            }else{//reject
                Realtime.findOneAndUpdate({_id:req.body._id},{status:3},{new:true,upsert:true},function(err,data){
                    if(!err){
                        socket.emit("reject",data);
                        socket.broadcast.emit("reject",data);
                    }
                });
            }
        }else{//admin
            const data = req.body;
            let today = new Date();
            let leave_id = today.getFullYear()*(today.getMonth()+today.getDate()+today.getDay())*(today.getHours()+today.getMinutes()+today.getSeconds()+today.getMilliseconds());
            Nurse.findOneAndUpdate({_id:data.nurse_id},
                {$push:{"leave":{leave_id:leave_id,from:data.from,to:data.to, type: data.type}}}
            ).then(function(data){
                Nurse.find({},function(err,nurses){
                    socket.emit("adminedit",{data:data,request:req.originalUrl,NurseDatas:nurses});
                    socket.broadcast.emit("adminedit",{data:data,request:req.originalUrl,NurseDatas:nurses});
                    res.send({state:"success"});
                });
            });
        }
    });
    router.route("/remove").post(function(req,res){
        if(req.role == 0){
            Realtime.create({
                request:req.originalUrl,
                level:1,
                status:1,
                data:req.body,
            },function(err,data){
                if(!err){
                    res.send({state:"success"});
                    socket.emit("request",data);
                    socket.broadcast.emit("request",data);
                }
            });
        }else if(req.role == 1){
            if(req.body.status == 2){
                Realtime.findOneAndUpdate({_id:req.body._id},{status:2},{new:true,upsert:true},function(err,data){
                    if(!err){
                        Nurse.findOneAndUpdate({_id:req.body.data.nurse_id},
                            {$pull:{"leave":{leave_id:req.body.data.leave_id}}}
                        ).then(function(data){
                            Nurse.find({},function(err,nurses){
                                if(!err){
                                    socket.emit("approve",{...req.body,NurseDatas:nurses});
                                    socket.broadcast.emit("approve",{...req.body,NurseDatas:nurses});
                                    res.send({state:"success"});
                                }
                            });
                        });
                    }
                });
            }else{
                Realtime.findOneAndUpdate({_id:req.body._id},{status:3},{new:true,upsert:true},function(err,data){
                    if(!err){
                        socket.emit("reject",data);
                        socket.broadcast.emit("reject",data);
                    }
                });
            }
        }else{
            const data = req.body;
            Nurse.findOneAndUpdate({_id:data.nurse_id},
                {$pull:{"leave":{leave_id:data.leave_id}}}
            ).then(function(data){
                Nurse.find({},function(err,nurses){
                    socket.emit("adminedit",{_id:req.body,request:req.originalUrl,NurseDatas:nurses});
                    socket.broadcast.emit("adminedit",{_id:req.body,request:req.originalUrl,NurseDatas:nurses});
                    res.send({state:"success"});
                });
            });
        }
    });

    router.route("/edit").post(function(req,res){
        if(req.role == 0){
            Realtime.create({
                request:req.originalUrl,
                level:1,
                status:1,
                data:req.body,
            },function(err,data){
                if(!err){
                    res.send({state:"success"});
                    socket.emit("request",data);
                    socket.broadcast.emit("request",data);
                }
            });
        }else if(req.role == 1){
            if(req.body.status == 2){
                Realtime.findOneAndUpdate({_id:req.body._id},{status:2},{new:true,upsert:true},function(err,data){
                    if(!err){
                        Nurse.findOneAndUpdate({_id:req.body.data.nurse_id},
                            {$set:{"leave.$[el].from": req.body.data.from,"leave.$[el].to": req.body.data.to }},
                            {
                                arrayFilters: [{ "el.leave_id": req.body.data.leave_id }],
                                new:true,
                            }
                        ).then(function(result){
                            Nurse.find({},function(err,nurses){
                                socket.emit("approve",{...req.body,NurseDatas:nurses});
                                socket.broadcast.emit("approve",{...req.body,NurseDatas:nurses});
                                res.send({state:"success"});
                            });
                        });
                    }
                });
            }else{
                Realtime.findOneAndUpdate({_id:req.body._id},{status:3},{new:true,upsert:true},function(err,data){
                    if(!err){
                        socket.emit("reject",data);
                        socket.broadcast.emit("reject",data);
                    }
                });
            }
        }else{
            const data = req.body;
            Nurse.findOneAndUpdate({_id:data.nurse_id},
                {$set:{"leave.$[el].from": data.from,"leave.$[el].to": data.to }},
                {
                    arrayFilters: [{ "el.leave_id": data.leave_id }],
                    new:true,
                }
            ).then(function(data){
                Nurse.find({},function(err,nurses){
                    socket.emit("adminedit",{request:req.originalUrl,NurseDatas:nurses});
                    socket.broadcast.emit("adminedit",{request:req.originalUrl,NurseDatas:nurses});
                    res.send({state:"success"});
                });
            });
        }
    });

    return router;
}