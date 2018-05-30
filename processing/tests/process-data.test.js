const { average, standardDeviation, processData } = require('../process-data.js')

test('tests average', () => {
  expect(average([2, 10, 5, 3, 28, 0])).toEqual(8)
})

test('tests standardDeviation', () => {
  expect(standardDeviation([10, 2, 38, 23, 38, 23, 21])).toBeCloseTo(12.298996142875, 10)
})

const benchmarkResultsFolder = './tests/test-benchmark-results'
const settings = {
  "whitelist": {
    "opencl": {
      "GTX780": {},
      "K40": {},
    },
    "pyopencl": {
      "GTX780": {},
    }
  }
}

test('tests processData', () => {
  expect(processData({
    files: [
      'futhark-opencl-GTX1060-0000000000000000000000000000000000000001.json', // Is not whitelisted
      'futhark-opencl-GTX780-0000000000000000000000000000000000000001.json', // Simple, contains stderr
      'futhark-opencl-GTX780-0000000000000000000000000000000000000002.json', // Contains loads of errors, empty benchmarks
      'futhark-opencl-GTX780-0000000000000000000000000000000000000003.json', // Does not have commitData
      'futhark-opencl-K40-0000000000000000000000000000000000000001.json', // Contains loads of errors, empty datasets
      'futhark-pyopencl-GTX780-0000000000000000000000000000000000000001.json', // Different backend
    ],
    commitData: {
      '0000000000000000000000000000000000000001': {
        date: new Date('2018-01-01 12:00:00 +0200')
      },
      '0000000000000000000000000000000000000002': {
        date: new Date('2018-01-02 12:00:00 +0200')
      },
    },
    benchmarkResultsFolder,
    settings
  })).toEqual({
    "combined": {
      "opencl": {
        "GTX780": {
          "0000000000000000000000000000000000000001": {
            "test.fut": {
              "datasets": {
                "dataset1": {
                  "avg": 15,
                  "stdDev": 4,
                },
                "dataset2": {
                  "avg": 200,
                  "stdDev": 82,
                },
              },
            },
          },
          "0000000000000000000000000000000000000002": {
            "test.fut": {
              "datasets": {
                "dataset1": {
                  "avg": 20,
                  "stdDev": 4,
                },
                "dataset2": {
                  "avg": 500,
                  "stdDev": 163,
                },
              },
            },
          },
        },
        "K40": {
          "0000000000000000000000000000000000000001": {
            "test.fut": {
              "datasets": {
                "dataset1": {
                  "avg": 100,
                  "stdDev": 41,
                },
                "dataset2": {
                  "avg": 200,
                  "stdDev": 41,
                },
              },
            },
          },
        },
      },
      "pyopencl": {
        "GTX780": {
          "0000000000000000000000000000000000000001": {
            "test.fut": {
              "datasets": {
                "dataset1": {
                  "avg": 2,
                  "stdDev": 1,
                },
                "dataset2": {
                  "avg": 20,
                  "stdDev": 8,
                },
              },
            },
          },
        },
      },
    },
    "metadata": {
      "benchmarks": {
        "test.fut": [
          "dataset1",
          "dataset2",
        ],
      },
      "commits": {
        "0000000000000000000000000000000000000001": {
          date: new Date("2018-01-01T10:00:00.000Z")
        },
        "0000000000000000000000000000000000000002": {
          date: new Date("2018-01-02T10:00:00.000Z")
        },
      },
      "skeleton": {
        "opencl": {
          "GTX780": {},
          "K40": {},
        },
        "pyopencl": {
          "GTX780": {},
        },
      },
    },
  })
})