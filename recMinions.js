'use strict';

const async = require('async');
const queueInfinite = require('./modules/1_queueInfiniteCalcs-module.js');
const expectedWaitTimes = require('./modules/2_expectedWaitTimes-module.js');
const recommendedMinions = require('./modules/3_recommendedMinions-module.js');
const writeToFile = require('./modules/writeToFile-module.js');
const printResults = require('./modules/printResults.js');
const roundNum = require('./modules/roundNum-module.js');


// user must provide 5 command line arguments:
// 1: number of developers
// 2: number of builds each developer builds per shift
// 3: the duration of the average build in their organization
// 4: the acceptable probability of a CI build waiting 5 minutes in the queue, i.e. 1 out of 10 builds wait 5 minutes (.10)
// 5: same as 4, but for 30 minute wait

const numDev = process.argv[2]; // peak number of developers in organization working concurrently
const numBuildsShift = process.argv[3]; // avg number of builds per peak shift per developer
const avgBuildDurationMin = process.argv[4]; // average build duration
const numShifts = 1; // number of developer shifts (i.e. 1 for single group of devs, 2 for U.S. and India, or 3 for 24-hr development)
const s = 10000;  // max number of build containers to calculate Queue stats for
const probAcceptable5MinWait = process.argv[5]; // acceptable probability of 5 minute wait time for build to start
const probAcceptable30MinWait = process.argv[6]; // acceptable probability of 30 minute wait time for build to start
const shiftDurationHours = 8; // shift duration in hours
const lambda = (numDev * numBuildsShift) / shiftDurationHours / numShifts;  // arrival rate per hour
const mu = 60 / avgBuildDurationMin; // hourly service rate, i.e.

// verify that valid inputs were provided as arguments
if (! process.argv[2] || ! process.argv[3] || ! process.argv[4] || ! process.argv[5] ||
   ! process.argv[6]) {
     printResults('Parameters required for: \navgBuildDurationMin, numShifts, ' +
      'maxNumberBuildContainersToEvaluate, AcceptableProb5MinWait, AcceptableProb30MinWait\n'+
      'for example: $ node infiniteQueueCalc.js 50 5 20 .1 0'
    );
    return;
   }

//first function that must run with its parameters
const qI = async.apply(queueInfinite, lambda, mu, s);
//second function that must run with its parameters
const eWT = async.apply(expectedWaitTimes, lambda, mu);
//third function that must run with its parameters
const rM = async.apply(recommendedMinions, probAcceptable5MinWait, probAcceptable30MinWait);

//composition of all three functions.  Results of each function are passed to the
//next function as a parameter appended to those already provided above.
const calcQueueingModelResults = async.seq(qI, eWT, rM);

//calculate the queuing model results and return the results to the console
calcQueueingModelResults(function(err, result) {
  if (err) {
    console.error(err);
    return;
  }
  printResults('');
  printResults('*** Recommended minion count: ' + result[0] + ' ***');
  printResults('');
  printResults('Probability of X minute wait time for specified number of minions:');
  printResults(result[1]);
  printResults('');
  printResults(result[2]);
  printResults('');
});
