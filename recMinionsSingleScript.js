'use strict';

var async = require('async');

// this is an abbreviated version of the calculator 'recMinions.js'
// in this version, only two inputs are accepted - the number of builds submitted
// in the peak hour of the day (commits + PRs) and the average duration of builds
// in minutes.  also, the recommended minions are hard-coded to return the
// number that will result in a 99% chance that a build will not wait in the queue
// more than 30 seconds.

// user must provide the following command line arguments:
// 1: number of builds (commits + PRs) submitted during peak hour
// 2: the duration of the average build in their organization

var numBuildsAtPeak = process.argv[2] || 12; // avg number of builds per peak shift per developer
var avgBuildDurationMin = process.argv[3] || 20; // average build duration
var s = 1000;  // max number of build containers to calculate Queue stats for
var probAcceptable30secWait = 0.01; // acceptable probability of 5 minute wait time for build to start
var lambda = numBuildsAtPeak ;  // arrival rate per hour
var mu = 60 / avgBuildDurationMin; // hourly service rate, i.e.

//first function that must run with its parameters
var qI = async.apply(queueInfinite, lambda, mu, s);
//second function that must run with its parameters
var eWT = async.apply(expectedWaitTimes, lambda, mu);
//third function that must run with its parameters
var rM = async.apply(recommendedMinions, probAcceptable30secWait);

//composition of all three functions.  Results of each function are passed to
//the next function as a parameter appended to those already provided above.
var calcQueueingModelResults = async.seq(qI, eWT, rM);

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
});

//first task in execution workflow
function queueInfinite(lambda, mu, s, results) {
  var resultsInfiniteAll = [];  // result array of all queue calcs for all build counts
  var header = ['numMinions', 'avgNumWaiting', 'avgWaitDuration', 'avgMinionUtilization'];
  resultsInfiniteAll.push(header);

  for (var j=1; j<=s; j++) {
    var resultsInfiniteNumMinions = [];  // result array for queue calcs for specific build count
    var r = lambda / mu;
    var rho = r / j;
    var term = (1 - rho) / rho;
    var queue = term;
    for (var i=1; i<=(j-1); i++) {
      term = term * (j - i) / r;
      queue = queue + term;
    }
    var avgNumWaiting = (rho / (1 - rho)) / (1 + queue);  // in builds
    var avgWaitDuration = (avgNumWaiting / lambda) * 60;  // in minutes
    var avgMinionUtilization = (lambda / (mu * j));

    resultsInfiniteNumMinions[0] = Number(j);  // number of build minions
    if (avgNumWaiting < 0 || avgWaitDuration < 0.01) {  // stop processing if results become insignificant - 0.01 minutes = 36 seconds
      continue;
    } else {
    resultsInfiniteNumMinions[1] = roundNum(avgNumWaiting, 3);
    resultsInfiniteNumMinions[2] = roundNum(avgWaitDuration, 3);
    resultsInfiniteNumMinions[3] = roundNum(avgMinionUtilization, 3);
    }

    resultsInfiniteAll.push(resultsInfiniteNumMinions);
  }
  //callback
  return results(null, resultsInfiniteAll);
}

function expectedWaitTimes(lambda, mu, priorResults, results) {
  // For reference:
  // first row of queueStats contains headers
  // queueStats[0] = number of build minions
  // queueStats[1] = avgNumWaiting in queue
  // queueStast[2] = avgWaitDuration in queue
  // queueStats[3] = avgMinionUtilization

  var queueStats = priorResults;
  var resultsExpectedWaitAll = [];
  var minuteBuckets = ['Minions', 0.5, 5, 10, 15, 20, 25, 30];  // array of wait values in minutes to calc prob for
  resultsExpectedWaitAll.push(minuteBuckets);

  var k = queueStats.length;
  for (var j=1; j<=k-1; j++) {
    var resultsExpectedWaitNumMinions = [];
    var numBuildMinions = queueStats[j][0];
    var avgNumWaiting = queueStats[j][1];
    var avgWaitDuration = queueStats[j][2];
    var avgMinionUtilization = queueStats[j][3];

    resultsExpectedWaitNumMinions.push(roundNum(numBuildMinions, 2));

    for (var l=1; l<=minuteBuckets.length - 1; l++) {
      resultsExpectedWaitNumMinions.push(
        roundNum((1 - (1 - avgMinionUtilization)/avgMinionUtilization * avgNumWaiting *
        Math.exp((lambda - numBuildMinions * mu) * minuteBuckets[l] / 60)), 2));
    }
    resultsExpectedWaitAll.push(resultsExpectedWaitNumMinions);
  }
  return results(null, [resultsExpectedWaitAll, queueStats]);
}

// third function
function recommendedMinions(probAcceptable30secWait, priorResults, results) {
  // For reference:
  // first row of probTimes contains headers for the queue wait time in minutes
  // the subsequent rows contain the number of concurrent minions available followed
  // by the probability of a build waiting for the designated wait time, e.g.
  // .26 corresponding to the 5 column means a 26% probability a build will wait
  // in the queue for at least 5 minutes before starting to process.

  var max30s = probAcceptable30secWait;
  var probTimes = priorResults[0];
  var queueStats = priorResults[1];
  var position30s = probTimes[0].indexOf(0.5); //array position of 5 min wait times

  for (var j=1; j<=probTimes.length - 1; j++) {
    var numBuildMinions = probTimes[j][0];
    var prob30s = probTimes[j][position30s];
    if( prob30s >= 1 - max30s) {
      var recommendedMinionCount = numBuildMinions;
      return results(null, [recommendedMinionCount, probTimes, queueStats]);
    }
  }
}

function roundNum(num, digits) {
    return +(Math.round(num + 'e+'+digits)  + 'e-'+digits);
}

function printResults(result) {
    console.log(result);
}
