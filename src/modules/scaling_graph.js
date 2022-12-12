import React from 'react';
import JXG, { COORDS_BY_SCREEN, JSXGraph } from 'jsxgraph';
import { calculateScaledScore } from './results';
import SUBJECTS from './../data/2021_subjects.json';
import SCALINGDATA from './../data/2021_scaling_data.json';

// replace default font
JXG.Options.text.cssDefaultStyle = '';
JXG.Options.text.highlightCssDefaultStyle = '';
  
const COLORS = [
  'steelblue',
  'orangered',
  '#05b378', // green
  'darkviolet',
  'orange',
  'brown',
  'magenta',
];

export default class ScalingGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {createdObjects: []};
  }

  componentDidMount() {
    this.board = JXG.JSXGraph.initBoard("jsxgraph", { 
      axis: true, 
      boundingbox: [-9, 104, 113, -6], // min x, max y, max x, min y
      showCopyright: false, 
      showScreenshot: true, 
      showInfobox: false,
      zoom: {
        factorX: 1.25,  // horizontal zoom factor (multiplied to JXG.Board#zoomX)
        factorY: 1.25,  // vertical zoom factor (multiplied to JXG.Board#zoomY)
        wheel: true,     // allow zooming by mouse wheel or
                   // by pinch-to-toom gesture on touch devices
        needShift: false,   // mouse wheel zooming needs pressing of the shift key
        min: 1,        // minimal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomOut
        max: 50,       // maximal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomIn
      
        pinchHorizontal: true, // Allow pinch-to-zoom to zoom only horizontal axis
        pinchVertical: true,   // Allow pinch-to-zoom to zoom only vertical axis
        pinchSensitivity: 7    // Sensitivity (in degrees) for recognizing horizontal or vertical pinch-to-zoom gestures.
      },
      pan: {
        enabled: true,   // Allow panning
        needTwoFingers: false, // panning is done with two fingers on touch devices
        needShift: false, // mouse panning needs pressing of the shift key
      }
    });
    
    this.legend = JXG.JSXGraph.initBoard("jsxlegend", { 
      boundingbox: [0, 104, 20, -6], // min x, max y, max x, min y
      showCopyright: false, 
      showInfobox: false,
      showNavigation: false,
      zoom: {
        factorX: 1,  // horizontal zoom factor (multiplied to JXG.Board#zoomX)
        factorY: 1,  // vertical zoom factor (multiplied to JXG.Board#zoomY)
        wheel: false,     // allow zooming by mouse wheel or
                   // by pinch-to-toom gesture on touch devices
        needShift: true,   // mouse wheel zooming needs pressing of the shift key
        min: 1,        // minimal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomOut
        max: 11,       // maximal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomIn
      
        pinchHorizontal: false, // Allow pinch-to-zoom to zoom only horizontal axis
        pinchVertical: false,   // Allow pinch-to-zoom to zoom only vertical axis
        pinchSensitivity: 7    // Sensitivity (in degrees) for recognizing horizontal or vertical pinch-to-zoom gestures.
      },
      pan: {
        enabled: false,   // Allow panning
        needTwoFingers: true, // panning is done with two fingers on touch devices
        needShift: true, // mouse panning needs pressing of the shift key
      },
    }); 

    this.setState({originalObjects: [...this.board.objectsList]})
  }

  componentDidUpdate() {
    this.board.suspendUpdate();

    // clear board
    for (let object of [...this.board.objectsList]) {
      if (object.elType === "line" || object.elType === "curve" || (object.elType === "text" && object.htmlStr.length > 3) || (object.elType === "point" && object.Xjc !== null) || !this.state.originalObjects.includes(object))
      this.board.removeObject(object);
    }
    
    // generate scaling graphs
    let subjects = Object.keys(this.props.subjects).filter((subjectCode) => {return this.props.subjects[subjectCode] !== undefined});
    for (let [subjectIndex, subjectCode] of subjects.entries()) {
      // create function
      let a = SCALINGDATA[subjectCode]["a"];
      let b = SCALINGDATA[subjectCode]["b"];
      let c = SCALINGDATA[subjectCode]["c"];
      let subjectFunction = this.board.create('functiongraph', [function(x){
        return (a / (1 + Math.exp(-b * (x - c))));
      }, 0, 100], {strokeColor: COLORS[subjectIndex]});
      subjectFunction.hasPoint = function(x, y) {return false;}; // disable highlighting

      // plot raw score input
      let rawScore = this.props.subjects[subjectCode];
      if (!rawScore) continue;
      let scaledScore = calculateScaledScore(rawScore, subjectCode);
      this.board.create('point', [rawScore, scaledScore], {face: "cross", name: SUBJECTS[subjectCode]});
    }

    // clear legend
    for (let object of [...this.legend.objectsList]) {
      this.legend.removeObject(object);
    }

    // create legend
    let legend = this.legend.create('legend', [0, 100], {labels: subjects.map((subjectCode) => {return SUBJECTS[subjectCode]}), colors: COLORS, rowHeight: 30} );
    console.log(legend.lines.at(-1).label.getTextAnchor().usrCoords.at(-1));
    this.board.on('boundingbox', () => {
      console.log(this.board.getBoundingBox());
    })

    // create coordinates at mouse
    let mouseCoordinates = this.board.create('point', [0, 0], {
      fixed: true,
      size: 2, 
      fillColor: 'black', 
      highlightFillColor: 'black', 
      fillOpacity: 0.7, 
      highlightFillOpacity: 0.7, 
      highlightStrokeWidth: 0,
      strokeWidth: 0,   // disable stroke so only fill is considered
      precision: {  // ensures always highlighted
        touch: 0,
        mouse: 0,
        pen: 0
      }
    });
    mouseCoordinates.hideElement();
    let updateMouseCoordinates = () => {
      if (subjects.length < 1) return false;

      let coords = new JXG.Coords(COORDS_BY_SCREEN, this.board.getMousePosition(), this.board).usrCoords.slice(1);
      // let nearestX = Math.round(coords[0]);
      let nearestX = coords[0];

      if (nearestX >= 0 && nearestX <= 100) {
        mouseCoordinates.showElement();
        let closestSubject = subjects.reduce((subjectCode1, subjectCode2) => {  // get the subject with raw score closest to the cursor
          return (Math.abs(calculateScaledScore(nearestX, subjectCode1) - coords[1]) < Math.abs(calculateScaledScore(nearestX, subjectCode2) - coords[1])) ? subjectCode1 : subjectCode2;
        })
        let nearestY = calculateScaledScore(nearestX, closestSubject)
        mouseCoordinates.moveTo([nearestX, nearestY]);
        mouseCoordinates.setAttribute({name: `(${nearestX.toFixed(2)}, ${nearestY.toFixed(2)})`})
      } else {
        mouseCoordinates.hideElement();
      }
    }
    this.board.on('touchstart', updateMouseCoordinates);
    this.board.on('pointermove', updateMouseCoordinates);

    this.board.unsuspendUpdate();
  }

  render() {
    let maxWidth = Math.min(720, document.querySelector('#root').getBoundingClientRect().width - 40);  // kinda janky, tries to find width after padding
    let legendWidth = 110;
    return(
      <div>
        <h2 style={{marginBottom: 0}}>Subject Scaling Graph</h2>
        <div style={{display: "flex", justifyContent: "center"}}>
          <div id="jsxgraph" style={{width: maxWidth - legendWidth, height: maxWidth - legendWidth}}></div>
          <div id="jsxlegend" style={{width: legendWidth, height: maxWidth - legendWidth}}></div>
        </div>
      </div>
    );
  }
}