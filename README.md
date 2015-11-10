# queue-calculator

## Overview
This is an infinite queueing model calculator altered with language appropriate
for calculating the number of Continuous Integration build machines needed to
ensure sufficient capacity to limit wait times in the queue to the desired levels.

## Use
Once installed locally, execute the program with the following command:  
```node --harmony recMinions 24 5 20 .10 0```

Five command line arguments are required:

1. Peak number of developers working concurrently
2. Average number of builds per developer for that peak shift
3. Average build duration
4. Acceptable probability of a 5 minute wait time for build to start
5. Acceptable probability of 30 minute wait time for build to start

(Note: the code uses ECMA6 syntax, so you'll need to add the --harmony flag)

## Output
The output will display the recommended number of minions based on the parameters
provided, as follows:
```

*** Recommended minion count: 8 ***

Probability of X minute wait time for specified number of minions:
[ [ 'Minions', 5, 10, 15, 20, 25, 30, 45, 60 ],
  [ 5, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN ],
  [ 6, 0.46, 0.36, 0.28, 0.22, 0.17, 0.13, 0.06, 0.03 ],
  [ 7, 0.2, 0.12, 0.07, 0.04, 0.03, 0.02, 0, 0 ],
  [ 8, 0.08, 0.04, 0.02, 0.01, 0, 0, 0, 0 ],
  [ 9, 0.03, 0.01, 0, 0, 0, 0, 0, NaN ],
  [ 10, 0.01, 0, 0, 0, 0, 0, NaN, NaN ],
  [ 11, 0, 0, 0, 0, 0, 0, NaN, NaN ],
  [ 12, 0, 0, 0, 0, NaN, NaN, NaN, NaN ] ]

[ [ 'numMinions',
    'avgNumWaiting',
    'avgWaitDuration',
    'avgMinionUtilization' ],
  [ 5, NaN, NaN, 1 ],
  [ 6, 2.938, 11.75, 0.833 ],
  [ 7, 0.81, 3.241, 0.714 ],
  [ 8, 0.279, 1.115, 0.625 ],
  [ 9, 0.101, 0.403, 0.556 ],
  [ 10, 0.036, 0.144, 0.5 ],
  [ 11, 0.013, 0.05, 0.455 ],
  [ 12, 0.004, 0.017, 0.417 ] ]

```  

The first table above contains headers in the first row with the first column
indicating the number of minions and the following columns representing the wait time
in minutes for a build to wait in the queue before starting.  The data in the table
indicates the probability of a build waiting for a particular number of minutes given
the specified number of minions.  For example, in the above data, there is an
8% probability that a build will incur a 5 minute wait time if 8 minions are
available for use and a 20% probability if 7 minions are in use.
