// //for now api on same server as still need to setup master slave database
const express = require('express');
const router = express.Router();
const db = require('../db/index.js');
const md5 = require("blueimp-md5");
const aws = require ('../../awsUpload.js');
const awsAPI = require('../../awsUpload.js');
require('dotenv').config();

setInterval(removePastes, 3600000);

async function removePastes(){
    try {
        let results = await db.findRemove();
        let del = await db.remove();
        console.log(results);
        //create array of delete objects
        let objs = [];
        //assign to objects
        results.forEach(function (paste){
          objs.push({Key: `${paste.paste_path}.txt`});  
        })
        //call delete function
        let params = {
            Bucket: "tgust002-pastebin-pastes-bucket",
            Delete: {
                Objects:objs
            }
        }
        let res = await aws.deleteObj(params);
        
    }catch(e){
        console.log(e);
    }
}

router.get('/:find', async (req, res, next) => {
    try{
        let resultsPath = await db.get(req.params.find);
        console.log(resultsPath[0].paste_path);
        //use path to get file and return text from file
        const bucketParams = {
            Bucket: "tgust002-pastebin-pastes-bucket",
            Key: `${resultsPath[0].paste_path}.txt`
        }
        let paste = await aws.retrieveObj(bucketParams);
        // console.log(paste);
        res.json({text:paste});
    }catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.post('/create', async (req, res, next) => {
    let ip = req.header('x-forwarded-for') || req.ip;
    console.log(ip);
    //create hash
    let url = base_encode(md5(ip+Date.now()));
    console.log(url);
    //store file and get path
    let key = url;
    let date = new Date();
    let expir=0;
    if(req.body.expiration_length_in_minutes)expir = req.body.expiration_length_in_minutes;
    //upload to database
    try{
        let paste = await db.insert(url, expir, date.toISOString().slice(0,19).replace('T',' '), key);
        console.log(req.body.paste_contents);
        const bucketParams = {
            Bucket: "tgust002-pastebin-pastes-bucket",
            Key: `${key}.txt`,
            Body: Buffer.from(req.body.paste_contents, "utf-8")
        }
        let upload = await aws.uploadObj(bucketParams);
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


