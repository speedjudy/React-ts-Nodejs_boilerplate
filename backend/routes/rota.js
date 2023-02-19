const express = require("express");
const { updateMany } = require("../models/nurse.model");
const router = express.Router();
const Nurse = require("../models/nurse.model");
const Realtime = require('../models/realtime.model');

module.exports = function(socket) {
  router.route("/assign").post(async function (req, res) {
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
                  const assign = req.body.data;
                  let updateAssignNurse = [];
                  let updateAssignAllNurse = [];
              
                  assign.assignData.map((value, index) => {
                    if (value.nurse_id != "NA" && value.hour != "NA") {
                      updateAssignAllNurse.push({
                        _id: value.nurse_id,
                        date: value.date,
                        rotation: value.rotation,
                        patient_id: assign.patient_id,
                        duty_start: value.duty_start,
                        duty_end: value.duty_end,
                        hour: value.hour,
                      });
              
                      if (updateAssignNurse[value.nurse_id] === undefined) {
                        updateAssignNurse[value.nurse_id] = [
                          {
                            date: value.date,
                            rotation: value.rotation,
                            patient_id: assign.patient_id,
                            duty_start: value.duty_start,
                            duty_end: value.duty_end,
                            hour: value.hour,
                          },
                        ];
                      } else {
                        updateAssignNurse[value.nurse_id] = [
                          ...updateAssignNurse[value.nurse_id],
                          {
                            date: value.date,
                            rotation: value.rotation,
                            patient_id: assign.patient_id,
                            duty_start: value.duty_start,
                            duty_end: value.duty_end,
                            hour: value.hour,
                          },
                        ];
                      }
                    }
                  });
                  let step = async function () {
                    await new Promise(function (resolve) {
                      let flag = 0;
                      let month = assign.year + "-" + assign.month;
                      let daysInMonth = new Date(assign.year, assign.month, 0).getDate();
                      let firstDay = month + "-01";
                      let lastDay = month + "-" + daysInMonth;
                      Nurse.updateMany(
                        {},
                        {
                          $pull: {
                            rota: {
                              patient_id: assign.patient_id,
                              date: { $gte: firstDay, $lte: lastDay },
                            },
                          },
                        }
                      ).then(function () {
                        let flag_1 = 0;
                        let length = Object.keys(updateAssignAllNurse).length;
                        if (length == 0) {
                          resolve();
                        }
                        for (let index in updateAssignAllNurse) {
                          let nurse = updateAssignAllNurse[index];
                          Nurse.findByIdAndUpdate(nurse._id, {
                            $pull: {
                              rota: {
                                date: nurse.date,
                                duty_start: { $lte: nurse.duty_end },
                                duty_end: { $gte: nurse.duty_start },
                              },
                            },
                          }).then(function (data) {
                            flag_1++;
                            if (flag_1 == length) {
                              resolve();
                            }
                          });
                        }
                      });
                    });
                    await new Promise(function (resolve_1) {
                      let flag_2 = 0;
                      let length_1 = Object.keys(updateAssignNurse).length;
                      if (length_1 == 0) {
                        resolve_1();
                      }
                      for (let _id in updateAssignNurse) {
                        Nurse.findByIdAndUpdate(
                          _id,
                          { $push: { rota: { $each: updateAssignNurse[_id] } } },
                          { new: true, upsert: true },
                          function (err, data_1) {
                            flag_2++;
                            if (flag_2 == length_1) {
                              resolve_1();
                            }
                          }
                        );
                      }
                    });
                    Nurse.find({}, function (err_1, nurses) {
                      socket.emit("approve",{...req.body,NurseDatas:nurses});
                      socket.broadcast.emit("approve",{...req.body,NurseDatas:nurses});
                      res.send({state:"success"});
                    });
                  };
                  step();
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
      const assign = req.body;
      let updateAssignNurse = [];
      let updateAssignAllNurse = [];
  
      assign.assignData.map((value, index) => {
        if (value.nurse_id != "NA" && value.hour != "NA") {
          updateAssignAllNurse.push({
            _id: value.nurse_id,
            date: value.date,
            rotation: value.rotation,
            patient_id: assign.patient_id,
            duty_start: value.duty_start,
            duty_end: value.duty_end,
            hour: value.hour,
          });
  
          if (updateAssignNurse[value.nurse_id] === undefined) {
            updateAssignNurse[value.nurse_id] = [
              {
                date: value.date,
                rotation: value.rotation,
                patient_id: assign.patient_id,
                duty_start: value.duty_start,
                duty_end: value.duty_end,
                hour: value.hour,
              },
            ];
          } else {
            updateAssignNurse[value.nurse_id] = [
              ...updateAssignNurse[value.nurse_id],
              {
                date: value.date,
                rotation: value.rotation,
                patient_id: assign.patient_id,
                duty_start: value.duty_start,
                duty_end: value.duty_end,
                hour: value.hour,
              },
            ];
          }
        }
      });
      let step = async function () {
        await new Promise(function (resolve) {
          let flag = 0;
          let month = assign.year + "-" + assign.month;
          let daysInMonth = new Date(assign.year, assign.month, 0).getDate();
          let firstDay = month + "-01";
          let lastDay = month + "-" + daysInMonth;
          Nurse.updateMany(
            {},
            {
              $pull: {
                rota: {
                  patient_id: assign.patient_id,
                  date: { $gte: firstDay, $lte: lastDay },
                },
              },
            }
          ).then(function () {
            let flag_1 = 0;
            let length = Object.keys(updateAssignAllNurse).length;
            if (length == 0) {
              resolve();
            }
            for (let index in updateAssignAllNurse) {
              let nurse = updateAssignAllNurse[index];
              Nurse.findByIdAndUpdate(nurse._id, {
                $pull: {
                  rota: {
                    date: nurse.date,
                    duty_start: { $lte: nurse.duty_end },
                    duty_end: { $gte: nurse.duty_start },
                  },
                },
              }).then(function (data) {
                flag_1++;
                if (flag_1 == length) {
                  resolve();
                }
              });
            }
          });
        });
        await new Promise(function (resolve_1) {
          let flag_2 = 0;
          let length_1 = Object.keys(updateAssignNurse).length;
          if (length_1 == 0) {
            resolve_1();
          }
          for (let _id in updateAssignNurse) {
            Nurse.findByIdAndUpdate(
              _id,
              { $push: { rota: { $each: updateAssignNurse[_id] } } },
              { new: true, upsert: true },
              function (err, data_1) {
                flag_2++;
                if (flag_2 == length_1) {
                  resolve_1();
                }
              }
            );
          }
        });
        Nurse.find({}, function (err_1, nurses) {
          console.log('abc');
          socket.emit("adminedit",{request:req.originalUrl,NurseDatas:nurses});
          socket.broadcast.emit("adminedit",{request:req.originalUrl,NurseDatas:nurses});
          res.send({state:"success"});
        });
      };
      step();
    }
  });
  router.route("/report").post(function (req, res) {
    const data = req.body;
    Nurse.findOneAndUpdate(
      { _id: data._id },
      {
        $set: {
          "rota.$[el].hour": data.hour,
          "rota.$[el].service": data.service,
        },
      },
      {
        arrayFilters: [{ "el.date": data.date }],
        new: true,
      },
      function (err, data) {
        if (!err) {
          res.send(data);
        }
      }
    );
  });
  router.route("/delete").post(function (req, res) {
    const data = req.body;
    Nurse.findOneAndUpdate(
      {
        _id: data._id,
      },
      {
        $pull: {
          rota: {
            date: data.date,
          },
        },
      },
      { new: true, upsert: true },
      function (err, data) {
        if (!err) {
          res.send(data);
        }
      }
    );
  });

  return router;
}