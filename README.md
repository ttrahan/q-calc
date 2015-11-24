# queue-calculator

## Overview
This is an infinite queueing model calculator, written in Node.js, altered with language appropriate
for calculating the number of Continuous Integration build machines needed to
ensure sufficient capacity to limit wait times in the queue to the desired levels.

## Use
Once installed locally, execute the program with the following command:  
```node --harmony recMinions 24 0.8 1 20 .10 0```

Six command line arguments are required:

1. `24`  Peak number of developers working concurrently
2. `0.8` Average number of builds triggered per developer for that peak time
3. `1`   Length of the peak period (in hours)
4. `20`  Average build duration (in minutes)
5. `.10` Acceptable probability of a 5 minute wait time for build to start
6. `0`   Acceptable probability of 30 minute wait time for build to start

If no peak period, default to figures for an entire shift, e.g. 8 hours.

(Note: the code uses ECMA6 syntax, so you'll need to add the --harmony flag)

## Output
The output will display the recommended number of minions based on the parameters
provided, as follows:
```

*** Recommended minion count: 10 ***

Probability of X minute wait time for specified number of minions:
[ [ 'Minions', 0.5, 5, 10, 15, 20, 25, 30, 45, 60 ],
  [ 7, 0.75, 0.65, 0.56, 0.48, 0.42, 0.36, 0.31, 0.2, 0.13 ],
  [ 8, 0.44, 0.31, 0.21, 0.14, 0.09, 0.06, 0.04, 0.01, 0 ],
  [ 9, 0.25, 0.14, 0.07, 0.04, 0.02, 0.01, 0.01, 0, 0 ],
  [ 10, 0.13, 0.06, 0.02, 0.01, 0, 0, 0, 0, 0 ],
  [ 11, 0.06, 0.02, 0.01, 0, 0, 0, 0, 0, NaN ],
  [ 12, 0.03, 0.01, 0, 0, 0, 0, 0, NaN, NaN ],
  [ 13, 0.01, 0, 0, 0, 0, 0, NaN, NaN, NaN ],
  [ 14, 0.01, 0, 0, 0, 0, NaN, NaN, NaN, NaN ] ]

[ [ 'numMinions',
    'avgNumWaiting',
    'avgWaitDuration',
    'avgMinionUtilization' ],
  [ 7, 8.077, 25.241, 0.914 ],
  [ 8, 1.831, 5.721, 0.8 ],
  [ 9, 0.645, 2.017, 0.711 ],
  [ 10, 0.253, 0.789, 0.64 ],
  [ 11, 0.101, 0.316, 0.582 ],
  [ 12, 0.04, 0.125, 0.533 ],
  [ 13, 0.015, 0.048, 0.492 ],
  [ 14, 0.006, 0.018, 0.457 ] ]

```  

The first table above contains headers in the first row with the first column
indicating the number of minions and the following columns representing the wait time
in minutes for a build to wait in the queue before starting.  The data in the table
indicates the probability of a build waiting for a particular number of minutes given
the specified number of minions.  For example, in the above data, there is an
8% probability that a build will incur a 5 minute wait time if 8 minions are
available for use and a 20% probability if 7 minions are in use.
