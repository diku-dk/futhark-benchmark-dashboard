const { dashboard } = require('../modules/dashboard.js')

test('tests dashboard with two commits', () => {
  const commits = {
    "aaaa676095acb726a9201c621bc2c83a167571e7": {
      date: new Date('2018-01-01 12:00:00 +0200')
    },
    "7afc676095acb726a9201c621bc2c83a167571e7": {
      date: new Date('2018-01-02 12:00:00 +0200')
    }
  }

  const data = {
    opencl: {
      GTX780: {
        "7afc676095acb726a9201c621bc2c83a167571e7": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 2000
              }
            }
          }
        },
        "aaaa676095acb726a9201c621bc2c83a167571e7": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 4000
              }
            }
          }
        }
      }
    }
  }

  const result = dashboard(commits, data)

  expect(result.topScores.length).toEqual(1)
  expect(result.bottomScores.length).toEqual(0)
  expect(result.topScores[0].diff).toEqual(50)
})

test('tests dashboard with more commits', () => {
  const commits = {
    "aaaa676095acb726a9201c621bc2c83a167571e7": {
      date: new Date('2018-01-01 12:00:00 +0200')
    },
    "7afc676095acb726a9201c621bc2c83a167571e7": {
      date: new Date('2018-01-02 12:00:00 +0200')
    },
    "e9f295456aab4f38efb8836ffed3c1bbcffbcf70": {
      date: new Date('2017-01-02 12:00:00 +0200')
    }
  }

  const data = {
    opencl: {
      GTX780: {
        "7afc676095acb726a9201c621bc2c83a167571e7": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 2000
              }
            }
          }
        },
        "aaaa676095acb726a9201c621bc2c83a167571e7": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 4000
              }
            }
          }
        },
        "e9f295456aab4f38efb8836ffed3c1bbcffbcf70": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 1000
              }
            }
          }
        }
      }
    }
  }

  const result = dashboard(commits, data)

  expect(result.topScores.length).toEqual(1)
  expect(result.bottomScores.length).toEqual(0)
  expect(result.topScores[0].diff).toEqual(50)
})

test('tests dashboard with two commits but many datasets', () => {
  const commits = {
    "aaaa676095acb726a9201c621bc2c83a167571e7": {
      date: new Date('2018-01-01 12:00:00 +0200')
    },
    "7afc676095acb726a9201c621bc2c83a167571e7": {
      date: new Date('2018-01-02 12:00:00 +0200')
    }
  }

  const data = {
    opencl: {
      GTX780: {
        "7afc676095acb726a9201c621bc2c83a167571e7": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 2000
              }
            }
          },
          "TESTBENCHMAR2": {
            datasets: {
              "100": {
                avg: 1000
              }
            }
          },
          "TESTBENCHMAR3": {
            datasets: {
              "100": {
                avg: 500
              }
            }
          },
          "TESTBENCHMAR4": {
            datasets: {
              "100": {
                avg: 8000
              }
            }
          },
          "TESTBENCHMAR5": {
            datasets: {
              "100": {
                avg: 7000
              }
            }
          },
          "TESTBENCHMAR6": {
            datasets: {
              "100": {
                avg: 10000
              }
            }
          },
          "TESTBENCHMAR7": {
            datasets: {
              "100": {
                avg: 11000
              }
            }
          },
          "TESTBENCHMAR8": {
            datasets: {
              "100": {
                avg: 12000
              }
            }
          },
          "TESTBENCHMAR9": {
            datasets: {
              "100": {
                avg: 13000
              }
            }
          },
          "TESTBENCHMAR10": {
            datasets: {
              "100": {
                avg: 14000
              }
            }
          },
          "TESTBENCHMAR11": {
            datasets: {
              "100": {
                avg: 15000
              }
            }
          },
          "TESTBENCHMAR12": {
            datasets: {
              "100": {
                avg: 16000
              }
            }
          },
          "TESTBENCHMAR13": {
            datasets: {
              "100": {
                avg: 17000
              }
            }
          },
          "TESTBENCHMAR14": {
            datasets: {
              "100": {
                avg: 18000
              }
            }
          },
          "TESTBENCHMAR15": {
            datasets: {
              "100": {
                avg: 19000
              }
            }
          }
        },
        "aaaa676095acb726a9201c621bc2c83a167571e7": {
          "TESTBENCHMARK": {
            datasets: {
              "100": {
                avg: 4000
              }
            }
          },
          "TESTBENCHMAR2": {
            datasets: {
              "100": {
                avg: 5000
              }
            }
          },
          "TESTBENCHMAR3": {
            datasets: {
              "100": {
                avg: 300
              }
            }
          },
          "TESTBENCHMAR4": {
            datasets: {
              "100": {
                avg: 10000
              }
            }
          },
          "TESTBENCHMAR5": {
            datasets: {
              "100": {
                avg: 17000
              }
            }
          },
          "TESTBENCHMAR6": {
            datasets: {
              "100": {
                avg: 20000
              }
            }
          },
          "TESTBENCHMAR7": {
            datasets: {
              "100": {
                avg: 1000
              }
            }
          },
          "TESTBENCHMAR8": {
            datasets: {
              "100": {
                avg: 1200000
              }
            }
          },
          "TESTBENCHMAR9": {
            datasets: {
              "100": {
                avg: 3000
              }
            }
          },
          "TESTBENCHMAR10": {
            datasets: {
              "100": {
                avg: 4000
              }
            }
          },
          "TESTBENCHMAR11": {
            datasets: {
              "100": {
                avg: 15000
              }
            }
          },
          "TESTBENCHMAR12": {
            datasets: {
              "100": {
                avg: 17000
              }
            }
          },
          "TESTBENCHMAR13": {
            datasets: {
              "100": {
                avg: 18000
              }
            }
          },
          "TESTBENCHMAR14": {
            datasets: {
              "100": {
                avg: 19000
              }
            }
          },
          "TESTBENCHMAR15": {
            datasets: {
              "100": {
                avg: 20000
              }
            }
          }
        }
      }
    }
  }

  const result = dashboard(commits, data)

  expect(result.topScores.length).toEqual(10)
  expect(result.bottomScores.length).toEqual(4)
  expect(result.topScores[0].diff).toEqual(99)
  expect(result.bottomScores[0].diff).toEqual(-1000)

  expect(result.topScores[0].benchmark).toEqual("TESTBENCHMAR8")
  expect(result.bottomScores[0].benchmark).toEqual("TESTBENCHMAR7")
})
