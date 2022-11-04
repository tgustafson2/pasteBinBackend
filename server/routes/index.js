// //for now api on same server as still need to setup master slave database
const express = require('express');
const router = express.Router();
const db = require('../db');
const md5 = require("blueimp-md5");
require('dotenv').config();

setInterval(db.remove, 21600000);

router.get('/:find', async (req, res, next) => {
    try{
        let resultsPath = await db.get(req.params.find);
        //use path to get file and return text from file
        console.log(resultsPath);
        res.json(resultsPath);
    }catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.post('/create', async (req, res, next) => {
    let ip = req.header('x-forwarded-for') || req.ip;
    console.log(ip);
    // console.log(req.body.expir);
    //create hash
    let url = base_encode(md5(ip+Date.now()));
    console.log(url);
    //store file and get path
    let path = "C:/DUMMY";
    let date = new Date();
    let expir=0;
    if(req.body.expiration_length_in_minutes)expir = req.body.expir;
    //upload to database
    try{
        let paste = await db.insert(url, expir, date.toISOString().slice(0,19).replace('T',' '), path);
        res.json({shortlink: `${url}`})
    } catch (e) {
        console.log(e);
        //if paste already exists delete from file store
        res.sendStatus(500);
    }
})

function base_encode(num,base=62){
    let temp = ("0x"+num)/1;
    // console.log(temp);
    digits=[];
    while(temp>0){
        let remainder=Math.trunc((temp%base));
        // console.log(remainder);
        digits.push(remainder);
        temp=Math.trunc(temp/base);
    }
    // console.log(digits[0]);
    digits.reverse()//reverse
    let result = [];
    const encode = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i=0;i<7;i++){
        result.push(encode.charAt(digits[i]));
    }
    let url="";
    result.forEach(element => {
        url=url+element;
    });
    return url;//tostring
}
module.exports = router;


