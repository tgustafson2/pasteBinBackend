// Import required AWS SDK clients and commands for Node.js.
const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

const REGION = process.env.AWS_REGION;
const ACCESSKEYID = process.env.AWS_ACCESS_KEY_ID;
const SECRETACCESSKEY = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  apiVersion:'2006-03-01',
  accessKeyId: ACCESSKEYID,
  secretAccessKey: SECRETACCESSKEY,
  region: REGION
})

const s3 = new AWS.S3();

let awsAPI = {}

// Create and upload the object to the S3 bucket.
 awsAPI.uploadObj = async (bucketParams) => {
  
  try {
    console.log("In try");
    const data = await s3.putObject(bucketParams).promise();
    // return data; // For unit tests.
    
    console.log(
      "Successfully uploaded object: " +
        bucketParams.Bucket +
        "/" +
        bucketParams.Key
    );
  } catch (err) {
    console.log(`${ACCESSKEYID}` );
    console.log("Error", err);
  }
};
awsAPI.retrieveObj = async (bucketParams) => {
    try {
      // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
      const data = await s3.getObject(bucketParams).promise();
      let object = JSON.stringify(data.Body);
      return await data.Body.toString('utf-8');
    } catch (err) {
      console.log("Error", err);
    }
  };
  awsAPI.deleteObj = async (bucketParams) => {
    try {
      const data = await s3.deleteObjects(bucketParams).promise();
      console.log("Success. Object deleted.", data);
      return data; // For unit tests.
    } catch (err) {
      console.log("Error", err);
    }
  };

  module.exports = awsAPI
