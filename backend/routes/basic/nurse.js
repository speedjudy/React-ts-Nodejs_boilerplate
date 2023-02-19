const express = require("express");
const router = express.Router();

const Nurse = require('../../models/nurse.model'); 
const Realtime = require('../../models/realtime.model');

module.exports = function(socket) {
    router.route("/list").get(function(req,res){
        Nurse.findAll({},function(err,data){
            if(!err){
                res.send(data);
            }
        });
    });
    router.route("/add").post(function(req,res){//level 1
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
                        if(req.body.data.id == 0){//insert
                            Nurse.create({
                                ...req.body.data
                            },function(err,result){
                                if(!err){
                                    socket.emit("approve",{...req.body,data:result,insert:true});
                                    socket.broadcast.emit("approve",{...req.body,data:result,insert:true});
                                    res.send({state:"success"});
                                }
                            });
                        }else{//update
                            Nurse.findOneAndUpdate({_id:req.body.data.id},req.body.data,{new:true,upsert:true},function(err,result){
                                if(!err){
                                    socket.emit("approve",{...req.body,data:result,insert:false});
                                    socket.broadcast.emit("approve",{...req.body,data:result,insert:false});
                                    res.send({state:"success"});
                                }
                            });
                        }
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
            if(req.body.id == 0){
                Nurse.create({
                    ...req.body
                },function(err,data){
                    if(!err){
                        socket.emit("adminedit",{data:data,request:req.originalUrl,insert:true});
                        socket.broadcast.emit("adminedit",{data:data,request:req.originalUrl,insert:true});
                        res.send({state:"success"});
                    }
                });
            }else{
                Nurse.findOneAndUpdate({_id:req.body.id},req.body,{new:true,upsert:true},function(err,data){
                    if(!err){
                        socket.emit("adminedit",{data:data,request:req.originalUrl,insert:false});
                        socket.broadcast.emit("adminedit",{data:data,request:req.originalUrl,insert:false});
                        res.send({state:"success"});
                    }
                });
            }
        }
    });
    router.route('/remove').post(function(req,res){//level 1
        if(req.role == 0){//user
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
        }else if(req.role == 1){//approver 
            if(req.body.status == 2){//approve
                Realtime.findOneAndUpdate({_id:req.body._id},{status:2},{new:true,upsert:true},function(err,data){
                    if(!err){
                        Nurse.findOneAndRemove({_id:req.body.data._id},function(err,result){
                            if(!err){
                                socket.emit("approve",data);
                                socket.broadcast.emit("approve",data);
                                res.send({state:"success"});
                            }
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
            Nurse.findOneAndRemove({_id:req.body},function(err,result){
                if(!err){
                    socket.emit("adminedit",{_id:req.body,request:req.originalUrl});
                    socket.broadcast.emit("adminedit",{_id:req.body,request:req.originalUrl});
                    res.send({state:"success"});
                }
            });
        }
    });

    return router;
}