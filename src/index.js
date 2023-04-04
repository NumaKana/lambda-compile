import AWS from 'aws-sdk';
import bluebird from 'bluebird';
const  promisifyAll = bluebird.promisifyAll
import exec from './exec.js';

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

startTimer('init');

//process.env.LAMBDA_TASK_ROOT = `/mnt/c/Users/kr814/workspace_ubuntu/lambda-compile/deploy-2.23.6-1`;

import a from 'fs'
const fs = promisifyAll(a);
const s3 = promisifyAll(new AWS.S3(), {suffix: "Mysuffix"});
const BUCKET = 'lilycompile-save-tmp';
const LY_DIR = `${process.env.LAMBDA_TASK_ROOT}/ly`;
const mime = {
  pdf: 'application/pdf',
  midi: 'audio/midi',
  png: 'image/png'
};

process.chdir('/tmp');
process.env.PATH += `:${LY_DIR}/usr/bin`;
process.env.LD_LIBRARY_PATH = `${LY_DIR}/usr/lib`;

console.log(LY_DIR)

function noop () {}

// Make sure this declaration is hoisted
var curTimer = null;
function startTimer(label) {
  if (curTimer) console.timeEnd(curTimer);
  if (label) console.time(label);
  curTimer = label;
}

function generateId() {
  return [
    Date.now(),
    ...process.hrtime(),
    Math.random().toString(36).substr(2)
  ].join('-');
}

function runLilypond() {
  return exec(`${LY_DIR}/usr/bin/lilypond --formats=png --include="${__dirname}/fonts/font-stylesheets" -o file input.ly >&2`);
}

async function uploadFile(id, file, mode) {
  try {
    await s3.putObjectMysuffix({
      Bucket: BUCKET,
      Key: id,
      Body: await fs.readFileAsync(file),
      ContentType: mime[mode],
      StorageClass: 'REDUCED_REDUNDANCY'
    });
    return true;
  } catch (err) {
    return false;
  }
}

async function uploadFiles(id, result) {
    const filenames = a.readdirSync('/tmp');
    const files = {};
    for (let file of filenames){
        let extend = path.extname(file);
        extend = extend.split('.')[1];
        if(mime[extend]){
            files[file] = await uploadFile(file, file, extend);
        }
    }
    result.files = files;
  return result;
}

import {
  S3Client,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'ap-northeast-1',
});

const deleteAllObjects = async (bucketName) => {
  //get list of object in Bucket
  const objects = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
    })
  );

  if (objects.Contents) {
    const keys = objects.Contents.map((d) => ({
      Key: d.Key,
    }));
    //delete all object
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: keys },
      })
    );
  }
};


async function run(event) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const id = event.id || generateId();

  startTimer('writing input');
  Promise.all([
    deleteAllObjects(BUCKET),
    fs.writeFileAsync('input.ly', event.code)
   ]);

  startTimer('lilypond');
  let result = await runLilypond();
  result.id = id;

  startTimer('upload');
  result = await uploadFiles(id, result);

  startTimer(null);
  return result;
}

export function handler (event, context, callback) {
  run(event)
  .then(res => callback(null, res))
  .catch(err => {
    console.error('FAILING')
    callback(err)
  });
}