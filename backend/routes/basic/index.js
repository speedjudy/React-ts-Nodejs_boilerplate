const express = require("express");
const router = express.Router();

const Nurse = require('../../models/nurse.model');
const Patient = require('../../models/patient.model');
const User = require('../../models/user.model');
const Holiday = require('../../models/holiday.model');
const Realtime = require('../../models/realtime.model');

const app = express();

module.exports = function(socket) {
    router.route("/list").get(function(req,res){
        Nurse.find({},function(err,nurseData){
            if(!err){
                Patient.find({},function(err,patientData){
                    if(!err){
                        Realtime.find({},function(err,requestData){
                            if(!err){
                                Holiday.find({},function(err,holidayData){
                                    let holidays;
                                    if(holidayData == null || holidayData.length == 0){
                                        holidays = [];
                                    }else{
                                        holidays = holidayData[0].holiday
                                    }
                                    res.send({
                                        nurse:nurseData,
                                        patient:patientData,
                                        holiday:holidays,
                                        request:requestData,
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    router.route('/login').post(function(req,res){
        const user = req.body;
        User.findOne({user:user.email},function(err,data){
            if(!err){
                if(data == null){
                    res.send({
                        state:'nouser',
                    });
                }else{
                    if(data.password == user.password){
                        if(!err){
                            res.send({
                                state:'success',
                                token:data.token,
                                role:data.role
                            });
                        }
                    }else{
                        res.send({state:'wrongpwd'});
                    }
                }
            }else{
                res.send({
                    state:"error"
                });
            }
        });
    });
    router.route('/holiday/get').post(function(req,res){
        if(req.role == 0){
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
        }else if(req.role == 1){
            if(req.body.status == 2){
                Realtime.findOneAndUpdate({_id:req.body._id},{status:2},{new:true,upsert:true},function(err,data){
                    if(!err){
                        const holiday = req.body.data;
                        Holiday.find({},function(err,holidayList){
                            if(holidayList == null || holidayList.length == 0){
                                Holiday.create({
                                    holiday:[holiday.date]
                                },function(err,data){
                                    if(!err){
                                        socket.emit("approve",{...req.body,holiday:data.holiday});
                                        socket.broadcast.emit("approve",{...req.body,holiday:data.holiday});
                                        res.send({state:"success"});
                                    }
                                });
                            }else{
                                if(holiday.state == false){
                                    Holiday.findOneAndUpdate({},
                                        {$push:{"holiday":holiday.date}}
                                    ).then(function(data){
                                        Holiday.find({},function(err,data){
                                            if(data == null){
                                                socket.emit("approve",{...req.body,holiday:[]});
                                                socket.broadcast.emit("approve",{...req.body,holiday:[]});
                                                res.send({state:"success"});
                                            }else{
                                                socket.emit("approve",{...req.body,holiday:data[0].holiday});
                                                socket.broadcast.emit("approve",{...req.body,holiday:data[0].holiday});
                                                res.send({state:"success"});
                                            }
                                        });
                                    });
                                }else{
                                    Holiday.findOneAndUpdate({},
                                        {$pull:{"holiday":holiday.date}}
                                    ).then(function(data){
                                        Holiday.find({},function(err,data){
                                            if(data == null){
                                                socket.emit("approve",{...req.body,holiday:[]});
                                                socket.broadcast.emit("approve",{...req.body,holiday:[]});
                                                res.send({state:"success"});
                                            }else{
                                                socket.emit("approve",{...req.body,holiday:data[0].holiday});
                                                socket.broadcast.emit("approve",{...req.body,holiday:data[0].holiday});
                                                res.send({state:"success"});
                                            }
                                        });
                                    });
                                }
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
            const holiday = req.body;
            Holiday.find({},function(err,data){
                if(data == null || data.length == 0){
                    Holiday.create({
                        holiday:[holiday.date]
                    },function(err,data){
                        if(!err){
                            socket.emit("adminedit",{holiday:data.holiday,request:req.originalUrl});
                            socket.broadcast.emit("adminedit",{holiday:data.holiday,request:req.originalUrl});
                            res.send({state:"success"});
                        }
                    });
                }else{
                    if(holiday.state == false){
                        Holiday.findOneAndUpdate({},
                            {$push:{"holiday":holiday.date}}
                        ).then(function(data){
                            Holiday.find({},function(err,data){
                                if(data == null){
                                    socket.emit("adminedit",{holiday:[],request:req.originalUrl});
                                    socket.broadcast.emit("adminedit",{holiday:[],request:req.originalUrl});
                                    res.send({state:"success"});
                                }else{
                                    socket.emit("adminedit",{holiday:data[0].holiday,request:req.originalUrl});
                                    socket.broadcast.emit("adminedit",{holiday:data[0].holiday,request:req.originalUrl});
                                    res.send({state:"success"});
                                }
                            });
                        });
                    }else{
                        Holiday.findOneAndUpdate({},
                            {$pull:{"holiday":holiday.date}}
                        ).then(function(data){
                            Holiday.find({},function(err,data){
                                if(data == null){
                                    socket.emit("adminedit",{holiday:[],request:req.originalUrl});
                                    socket.broadcast.emit("adminedit",{holiday:[],request:req.originalUrl});
                                    res.send({state:"success"});
                                }else{
                                    socket.emit("adminedit",{holiday:data[0].holiday,request:req.originalUrl});
                                    socket.broadcast.emit("adminedit",{holiday:data[0].holiday,request:req.originalUrl});
                                    res.send({state:"success"});
                                }
                            });
                        });
                    }
                }
            });
        }
    });
    router.route('/request/close').post(function(req,res){
        Realtime.findOneAndRemove({_id:req.body._id},function(){
            socket.emit("close",req.body);
            socket.broadcast.emit("close",req.body);
            res.send({state:"success"});
        });
    });

    return router;
}