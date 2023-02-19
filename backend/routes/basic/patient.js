const express = require("express");
const router = express.Router();
const Patient = require('../../models/patient.model');
const Realtime = require('../../models/realtime.model');

module.exports = function(socket) {
    router.route("/list").get(function(req,res){
        Patient.findAll({},function(err,data){
            if(!err){
                res.send(data);
            }
        });
    });
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
                        if(req.body.data.id == 0){//insert
                            Patient.create({
                                ...req.body.data
                            },function(err,result){
                                if(!err){
                                    socket.emit("approve",{...req.body,data:result,insert:true});
                                    socket.broadcast.emit("approve",{...req.body,data:result,insert:true});
                                    res.send({state:"success"});
                                }
                            });
                        }else{//update
                            Patient.findOneAndUpdate({_id:req.body.data.id},req.body.data,{new:true,upsert:true},function(err,result){
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
                Patient.create({
                    ...req.body
                },function(err,data){
                    if(!err){
                        socket.emit("adminedit",{data:data,request:req.originalUrl,insert:true});
                        socket.broadcast.emit("adminedit",{data:data,request:req.originalUrl,insert:true});
                        res.send({state:"success"});
                    }
                });
            }else{
                Patient.findOneAndUpdate({_id:req.body.id},req.body,{new:true,upsert:true},function(err,data){
                    if(!err){
                        socket.emit("adminedit",{data:data,request:req.originalUrl,insert:false});
                        socket.broadcast.emit("adminedit",{data:data,request:req.originalUrl,insert:false});
                        res.send({state:"success"});
                    }
                });
            }
        }
    });
    router.route('/import').post(function(req,res){
        const datas = req.body.importData;
        let count = datas.length;
        let flag = 0;
        let step = function(){
            let notFoundPatient = [];
            return new Promise(function(resolve){
                for(let data of datas){
                    let Revenue = data.Revenue;
                    if(Revenue != 'Total'){
                        delete data.Revenue;
                        delete data.Total;
                        Patient.findOneAndUpdate({name:Revenue},[{"$set":{
                            "revenue":{
                            "$mergeObjects":[
                                "$revenue",
                                data
                            ]
                            }
                        }}],function(err,result){
                            if(!err){
                                if(result == null){
                                    notFoundPatient.push(Revenue);
                                }
                                console.log(Revenue,flag,count);
                                flag++;
                                if(flag == count-1){
                                    resolve();
                                }
                            }
                        });
                    }
                }
            }).then(function(){
                Patient.find({},function(err,data){
                    if(!err){
                        res.send({patients:data,notFound:notFoundPatient});
                    }
                });
            });
        }
        step();
    });
    router.route('/remove').post(function(req,res){
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
                        Patient.findOneAndRemove({_id:req.body.data._id},function(err,result){
                            if(!err){
                                socket.emit("approve",data);
                                socket.broadcast.emit("approve",data);
                                res.send({state:"success"});
                            }
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
            Patient.findOneAndRemove({_id:req.body},function(err,result){
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