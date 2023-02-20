const express = require("express");
const router = express.Router();
const Rental = require('../models/rental.model');

module.exports = function () {
    console.log("req");
    router.route("/add").post(function (req, res) {
        if (req.body.flag == "Save") {
            Rental.create({
                name: req.body.name,
                address: req.body.addr,
                image: req.body.image
            }, function (err, data) {
                console.log(data);
                if (!err) {
                    res.send({ state: "success" });
                }
            });
        } else {
            Rental.findOneAndUpdate({_id:req.body.flag},{
                name: req.body.name,
                address: req.body.addr,
                image: req.body.image
            },{new:true,upsert:true},function(err,data){
                if(!err){
                    res.send({ state: "success" });
                }
            });
        }
    });
    router.route("/get").post(function (req, res) {
        Rental.find({}, function (err, data) {
            if (!err) {
                res.send(data);
            }
        });
    });
    router.route("/remove").post(function (req, res) {
        Rental.findOneAndRemove({ _id: req.body.id }, function (err, result) {
            res.send({ state: "success" });
        });
    });
    return router;
}