import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import ReactEcharts from 'echarts-for-react';
//import * as d3 from "d3";
//var svg = d3.select("body").append("svg");

class App extends Component {
  render() {
    return (
      <div className="app">
        <ReactEcharts
		  option={{
		  	yAxis: {
		        type: 'value'
		    },
		    xAxis: {
		        type: 'category',
		        data: ["20-07-2017", "21-07-2017", "22-07-2017", "23-07-2017", "24-07-2017", "25-07-2017", "26-07-2017"]
		    },
		    series: [{
		        data: [820, 932, 901, 934, 1290, 1330, 1500],
		        type: 'line',
		        markPoint: {
		        	data: [
		        		{name : 'Test', value : 820, xAxis: "20-07-2017", yAxis: 820}
		        	]
		        },
		        markLine : {
	                data : [
	                    {
	                    	type : 'average', 
	                    	name : 'Average',
	                    	label: {
	                            normal: {
	                                position: 'end',
	                                formatter: 'Average'
	                            }
	                        }
	                	},
	                    [{
	                        symbol: 'none',
	                        x: '90%',
	                        yAxis: 'max'
	                    }, {
	                        symbol: 'circle',
	                        label: {
	                            normal: {
	                                position: 'start',
	                                formatter: 'Max'
	                            }
	                        },
	                        type: 'max',
	                        name: 'Max'
	                    }]
	                ]
	            }
		    }],
		    title: {
		        text: 'Performance',
		        subtext: "Benchmarks"
		    },
		    legend: {
		        data: ['Punch Card'],
		        left: 'right'
		    },
		    tooltip: {
		        formatter: function (params) {
		        	return params.value
		        }
		    },
		    toolbox: {
		    	right: 40,
		        show : true,
		        feature : {
		            dataView : {
		            	show: true,
		            	readOnly: false,
		            	title: "Dataview",
		            	lang: ["Data view", "Turn off", "Refresh"]
		            },
		            magicType : {
		            	show: true,
		            	type: ['line', 'bar'],
		            	title: {
		            		line: "Line",
		            		bar: "Bar"
		            	},
		            	showTitle: true
		        	},
		            restore : {
		            	show: true,
		            	title: "Restore"
		            },
		            saveAsImage : {
		            	show: true,
		            	title: "Save as Image"
		            }
		        }
		    }
		  }}
		  notMerge={true}
		  lazyUpdate={true}
		  theme={"dark"}
		  opts={{}}
		 />
      </div>
    );
  }
}

export default App;
