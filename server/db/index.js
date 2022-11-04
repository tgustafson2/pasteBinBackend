const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    password: process.env.MYSQL_PASSWORD,
    user: process.env.MYSQL_USER,
    database: "pastebin",
    host: 'localhost',
    port: '3306'
});

let pastesdb = {};

pastesdb.get = (url) =>{
    return new Promise((resolve, reject) =>{
        pool.query(`SELECT paste_path, created_at, expiration_length_in_minutes from pastes WHERE shortlink = "${url}"`, (err,results) => {
            if(err){
                return reject(err);
            }
            return resolve(results);
        })
    })
}
pastesdb.insert = (shortlink, expir, created, paste_path) => {
    return new Promise((resolve, reject) =>{
        let sql = `INSERT INTO pastebin.pastes (shortlink, expiration_length_in_minutes, created_at, paste_path) VALUES ("${shortlink}", ${expir}, "${created}", "${paste_path}")`;
        pool.query(sql, (err,results)=>{
            if(err){
                return reject(err);
            }
            return resolve(results);
        })
    })
}

pastesdb.remove = () =>{
    return new Promise((resolve, reject) => {
        let sql = "DELETE FROM pastebin.pastes WHERE TIMESTAMPDIFF(MINUTE, CURRENT_TIMESTAMP(), created_at)> expiration_length_in_minutes AND expiration_length_in_minutes>0";

    })
}

module.exports = pastesdb
