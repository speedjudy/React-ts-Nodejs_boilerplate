const express = require("express");
const md5 = require("md5");
const router = express.Router();
const User = require('../models/user.model');

module.exports = function () {
    console.log("req");
    router.route("/signup").post(function (req, res) {
        User.findOne({username:req.body.username},function(err,data){
            if (data) {
                res.send({ state: "alreadyuser" });
            } else {
                User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    token: md5(req.body.username + "__" + req.body.password),
                    role: 0,
                }, function (err, data) {
                    console.log(data);
                    if (!err) {
                        res.send({ state: "success" });
                    }
                });
            }
        });
    });
    router.route("/signin").post(function (req, res) {
        const user = req.body;
        User.findOne({username:user.username},function(err,data){
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
                                username:data.username,
                                email:data.email,
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
    return router;
}