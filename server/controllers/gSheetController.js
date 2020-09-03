const express = require('express');
const router = express.Router({mergeParams: true});
// const googleDriveService = require("../services/GoogleDrive");
const responseBaseClass = require("../BaseClasses/GenericResponse");
const gSheetService = require("../services/GoogleSheetService");

router.get("/",async function(req,res){
    try{
        let result = await gSheetService.readSheet(req,res);
        let gr = new responseBaseClass.GenericResponse(`${result.status ? "success" : "error"}`,result.res);
        res.send(gr.response())
    }
    catch(err){
        let gr = new responseBaseClass.GenericResponse("error",err.toString())
        res.send(gr.response())
    }
})

router.get("/create",async function(req,res){
    try{
        let result = await gSheetService.createSheet(req,res);
        let gr = new responseBaseClass.GenericResponse(`${result.status ? "success" : "error"}`,result.res);
        res.send(gr.response())
    }
    catch(err){
        let gr = new responseBaseClass.GenericResponse("error",err.toString())
        res.send(gr.response())
    }
})

module.exports = router;