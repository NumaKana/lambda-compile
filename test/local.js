import { resolve } from 'path';
const version = process.argv[2];

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.length < 2) {
  console.error('test/local.js <stable|unstable>');
  process.exit(1);
}

process.env.LAMBDA_TASK_ROOT = resolve(__dirname, '..', `deploy-${version}`);

import event from './payload.json' assert { type: "json" };
const context = {
  succeed(result) {
    console.log('Success!!!')
    console.log(result)
  },
  fail(error) {
    console.log('FAIL!!!')
    console.log(error)
  },
  done(err, result) {
    console.log('DONE!!!')
    console.log('Error:', err)
    console.log('Result:', result)
  }
};
const callback = context.done;

import { handler } from '../deploy2.23.6-1/index.mjs';

handler(event, context, callback);
