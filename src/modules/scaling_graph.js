import React from 'react';
import JXG from 'jsxgraph';
import { calculateScaledScore } from './results';
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
];
  
const COLORS = [
  'steelblue',
  'red',
  '#05b378', // green
  'orange',
  'brown',
  'magenta',
  'cyan'
];

export default class ScalingGraph extends React.Component {
  componentDidUpdate() {
    let board = JXG.JSXGraph.initBoard("jsxgraph", { 
      axis: true, 
      boundingbox: [-9, 104, 105, -6], 
      showCopyright: false, 
      showScreenshot: true, 
      showInfobox: true,
      zoom: {
        factorX: 1.25,  // horizontal zoom factor (multiplied to JXG.Board#zoomX)
        factorY: 1.25,  // vertical zoom factor (multiplied to JXG.Board#zoomY)
        wheel: true,     // allow zooming by mouse wheel or
                   // by pinch-to-toom gesture on touch devices
        needShift: false,   // mouse wheel zooming needs pressing of the shift key
        min: 1,        // minimal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomOut
        max: 10,       // maximal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomIn
      
        pinchHorizontal: true, // Allow pinch-to-zoom to zoom only horizontal axis
        pinchVertical: true,   // Allow pinch-to-zoom to zoom only vertical axis
        pinchSensitivity: 7    // Sensitivity (in degrees) for recognizing horizontal or vertical pinch-to-zoom gestures.
      },
      pan: {
        enabled: true,   // Allow panning
        needTwoFingers: false, // panning is done with two fingers on touch devices
        needShift: false, // mouse panning needs pressing of the shift key
      },
      showFullscreen: true
    });
    
    board.suspendUpdate();
    let subjects = Object.keys(this.props.subjects).filter((subjectCode) => {return this.props.subjects[subjectCode] !== undefined});
    for (let [subjectIndex, subjectCode] of subjects.entries()) {
      // create function
      let a = SCALINGDATA[subjectCode]["a"];
      let b = SCALINGDATA[subjectCode]["b"];
      let c = SCALINGDATA[subjectCode]["c"];
      board.create('functiongraph', [function(x){
        return (a / (1 + Math.exp(-b * (x - c))));
      }, 0, 100], {strokeColor: COLORS[subjectIndex]});

      // plot raw score input
      let rawScore = this.props.subjects[subjectCode];
      let scaledScore = calculateScaledScore(rawScore, subjectCode);
      let point = board.create('point', [rawScore, scaledScore], {face: "cross"});
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