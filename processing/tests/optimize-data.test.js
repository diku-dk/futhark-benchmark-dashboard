const { optimizeBenchmarks } = require('../modules/optimize-data.js');

test('tests optimizeBenchmarks', () => {
  expect(optimizeBenchmarks({
    opencl: {
      GTX: {
        '0000000000000000000000000000000000000001': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 100
              },
              'dataset2': {
                avg: 30
              }
            }
          }
        },
        '0000000000000000000000000000000000000002': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 101
              },
              'dataset2': {
                avg: 30
              }
            }
          }
        },
        '0000000000000000000000000000000000000003': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 102
              },
              'dataset2': {
                avg: 30
              }
            }
          }
        },
        '0000000000000000000000000000000000000004': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 101
              },
              'dataset2': {
                avg: 10
              }
            }
          }
        },
        '0000000000000000000000000000000000000005': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 120
              },
              'dataset2': {
                avg: 10
              }
            }
          }
        },
        '0000000000000000000000000000000000000006': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 121
              },
              'dataset2': {
                avg: 10
              }
            }
          }
        },
        '0000000000000000000000000000000000000007': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 100
              },
              'dataset2': {
                avg: 10
              }
            }
          }
        },
        '0000000000000000000000000000000000000008': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 100
              },
              'dataset2': {
                avg: 15
              }
            }
          }
        },
        '0000000000000000000000000000000000000009': {
          'test.fut': {
            datasets: {
              'dataset1': {
                avg: 100
              },
              'dataset2': {
                avg: 15
              }
            }
          }
        },
      }
    }
  }, 0.03, {
    '0000000000000000000000000000000000000001': {
      date: new Date('2018-01-01 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000002': {
      date: new Date('2018-01-02 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000003': {
      date: new Date('2018-01-03 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000004': {
      date: new Date('2018-01-04 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000005': {
      date: new Date('2018-01-05 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000006': {
      date: new Date('2018-01-06 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000007': {
      date: new Date('2018-01-07 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000008': {
      date: new Date('2018-01-08 12:00:00 +0200')
    },
    '0000000000000000000000000000000000000009': {
      date: new Date('2018-01-09 12:00:00 +0200')
    }
  })).toEqual({
    opencl: {
      GTX: {
        "0000000000000000000000000000000000000001": {
         "test.fut": {
           "datasets": {
             "dataset1": {
               "avg": 100,
              },
             "dataset2": {
               "avg": 30,
             },
           },
         },
        },
        "0000000000000000000000000000000000000003": {
         "test.fut": {
           "datasets": {
             "dataset2": {
               "avg": 30,
             },
           },
         },
        },
        "0000000000000000000000000000000000000004": {
         "test.fut": {
           "datasets": {
             "dataset1": {
               "avg": 101,
             },
             "dataset2": {
               "avg": 10,
             },
           },
         },
        },
        "0000000000000000000000000000000000000005": {
         "test.fut": {
           "datasets": {
             "dataset1": {
               "avg": 120,
             },
           },
         },
        },
        "0000000000000000000000000000000000000006": {
         "test.fut": {
           "datasets": {
             "dataset1": {
               "avg": 121,
             },
           },
         },
        },
        "0000000000000000000000000000000000000007": {
         "test.fut": {
           "datasets": {
             "dataset1": {
               "avg": 100,
             },
             "dataset2": {
               "avg": 10,
             },
           },
         },
        },
        "0000000000000000000000000000000000000008": {
         "test.fut": {
           "datasets": {
             "dataset2": {
               "avg": 15,
             },
           },
         },
        },
        "0000000000000000000000000000000000000009": {
         "test.fut": {
           "datasets": {
             "dataset1": {
               "avg": 100,
             },
             "dataset2": {
               "avg": 15,
             },
           },
         },
        },
      }
    }
  });
});
