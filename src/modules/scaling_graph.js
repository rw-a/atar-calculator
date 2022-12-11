import React from 'react';
import JXG from 'jsxgraph';
import SUBJECTS from './../data/2021_subjects.json';
import SCALINGDATA from './../data/2021_scaling_data.json';

const COLORS1 = [
    "#ff0000",
    "#ff8700",
    "#ffd300",
    "#deff0a",
    "#a1ff0a",
    "#0aff99",
    "#0aefff",
    "#147df5",
    "#580aff",
    "#be0aff"
  ]
  
  const COLORS = [
    'steelblue',
    'red',
    '#05b378', // green
    'orange',
    'brown',
    'magenta',
    'cyan'
  ]

export default class ScalingGraph extends React.Component {
    componentDidUpdate() {
      let board = JXG.JSXGraph.initBoard("jsxgraph", { axis: true, boundingbox: [-5, 104, 105, -6], showCopyright: false });
      
      board.suspendUpdate();
      let subjects = Object.keys(this.props.subjects).filter((subjectCode) => {return this.props.subjects[subjectCode] !== undefined});
      for (let [subjectIndex, subjectCode] of subjects.entries()) {
        let a = SCALINGDATA[subjectCode]["a"];
        let b = SCALINGDATA[subjectCode]["b"];
        let c = SCALINGDATA[subjectCode]["c"];
  
        board.create('functiongraph', [function(x){
          return (a / (1 + Math.exp(-b * (x - c))));
        }, 0, 100], {strokeColor: COLORS[subjectIndex]});
      }
      board.create('legend', [5, 100], {labels: subjects.map((subjectCode) => {return SUBJECTS[subjectCode]}), colors: COLORS} );
      board.unsuspendUpdate();
    }
  
    render() {
      let width = Math.min(720, document.querySelector('#root').getBoundingClientRect().width - 40);  // kinda janky, tries to find width after padding
      return(
        <div>
          <h2 style={{marginBottom: 0}}>Subject Scaling Graph</h2>
          <div id="jsxgraph" style={{width: width, height: width}}></div>
        </div>
      );
    }
  }