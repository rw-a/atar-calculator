import './../css/scaling.css';
import React from 'react';
import JXG, { COORDS_BY_SCREEN } from 'jsxgraph';

import { calculateScaledScore } from './results';

import SUBJECTS from '../data/all_subjects.json';
import { getScalingData } from './data';
  
const COLORS = [
  'steelblue',
  'orangered',
  '#05b378', // green
  'darkviolet',
  'orange',
  'brown',
  'magenta'
];

const BOUNDING_BOX = [-9, 103, 113, -6]; // min x, max y, max x, min y

const LEGEND_WIDTH = 110;

const SUBJECT_LABELS_ZOOM_THRESHOLD = 1.7;
const MOBILE_LEGEND_ZOOM_THRESHOLD = 10;

// replace default font
JXG.Options.text.cssDefaultStyle = 'z-index: 0';
JXG.Options.text.highlightCssDefaultStyle = '';

export default class ScalingGraph extends React.Component {
  componentDidMount() {
    this.board = JXG.JSXGraph.initBoard("jsxgraph", { 
      axis: true, 
      maxFrameRate: 30,
      boundingbox: BOUNDING_BOX, 
      maxboundingbox: [-100, 200, 200, -100],
      showCopyright: false, 
      showInfobox: false,
      // showNavigation: false,
      zoom: {
        factorX: 1.25,  // horizontal zoom factor (multiplied to JXG.Board#zoomX)
        factorY: 1.25,  // vertical zoom factor (multiplied to JXG.Board#zoomY)
        wheel: true,     // allow zooming by mouse wheel or
                   // by pinch-to-toom gesture on touch devices
        needShift: false,   // mouse wheel zooming needs pressing of the shift key
        min: 1,        // minimal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomOut
        max: 50,       // maximal values of JXG.Board#zoomX and JXG.Board#zoomY, limits zoomIn
      
        pinchHorizontal: false, // Allow pinch-to-zoom to zoom only horizontal axis
        pinchVertical: false,   // Allow pinch-to-zoom to zoom only vertical axis
        pinchSensitivity: 7    // Sensitivity (in degrees) for recognizing horizontal or vertical pinch-to-zoom gestures.
      },
      pan: {
        enabled: true,   // Allow panning
        needTwoFingers: false, // panning is done with two fingers on touch devices
        needShift: false, // mouse panning needs pressing of the shift key
      },
      navbar:  {
        strokeColor: '#333333',
        fillColor: 'transparent',
        highlightFillColor: '#aaaaaa',
        padding: '0px',
        position: 'absolute',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: '100',
        right: '5px',
        bottom: '0px',
      }
    });
    
    this.legend = JXG.JSXGraph.initBoard("jsxlegend", { 
      boundingbox: [0, 120, 20, 0], // min x, max y, max x, min y
      maxFrameRate: 1,
      registerEvents: false,
      showCopyright: false, 
      showInfobox: false,
      showNavigation: false,
      zoom: {
        factorX: 1, 
        factorY: 1, 
        wheel: false,    
        needShift: true, 
        min: 1,      
        max: 1, 
      
        pinchHorizontal: false,
        pinchVertical: false, 
        pinchSensitivity: 7 
      },
      pan: {
        enabled: false,
        needTwoFingers: true,
        needShift: true,
      },
    }); 

    this.addZoomLevelListeners(); // this could be further optimised by only updating subject label listener, not whole legend listener
    this.createMouseCoordinates();

    this.originalObjects = [...this.board.objectsList]; // this needs to be after the mouse coordinates is created so it is preserved
    this.points = [];
    this.subjects = [];
    this.year = 2022;

    this.componentDidUpdate();
  }

  clearBoard() {
    let objectsList = [...this.board.objectsList];
    for (let index = objectsList.length - 1; index >= 0; index -= 1) {
      let object = objectsList[index];
      if (object.elType === "line" || object.elType === "curve" || (object.elType === "text" && object.htmlStr.length > 3 && object.visProp.cssclass !== "mouseCoordinates") || (object.elType === "point" && object.Xjc !== null) || !this.originalObjects.includes(object))
        this.board.removeObject(object.id);
    }
  }

  plotScalingFunctions() {
    for (let [subjectIndex, subjectCode] of this.subjects.entries()) {  // entries on a list does enumerate
      // create function
      const scalingData = getScalingData(this.props.year);
      let a = scalingData[subjectCode]["a"];
      let b = scalingData[subjectCode]["b"];
      let c = scalingData[subjectCode]["c"];
      let subjectFunction = this.board.create('functiongraph', [function(x){
        return (a / (1 + Math.exp(-b * (x - c))));
      }, 0, 100], {strokeColor: COLORS[subjectIndex % COLORS.length]});   // modulus ensures colours repeat if exhausted
      subjectFunction.hasPoint = function(x, y) {return false;}; // disable highlighting
    }
  }

  clearLegend() {
    let legendObjectsList = [...this.legend.objectsList];
    for (let index = legendObjectsList.length - 1; index >= 0; index -= 1) {
      let object = legendObjectsList[index];
      this.legend.removeObject(object.id);
    }
  }

  createLegend() {
    let subjectsNames = this.subjects.map((subjectCode) => {return SUBJECTS[subjectCode]});
    let longestSubjectName = subjectsNames.reduce((subject1, subject2) => {return (subject1.length > subject2.length) ? subject1 : subject2});
    let numLines = Math.ceil(longestSubjectName.length / 12);
    let rowHeight = numLines * 9 + 10;

    let legend = this.legend.create('legend', [0, 100], {labels: subjectsNames, colors: COLORS, rowHeight: rowHeight} );

    let legendHeight = legend.lines.at(-1).getTextAnchor().scrCoords.at(-1) + rowHeight + this.maxWidth / 30;
    document.getElementById('jsxlegend').style.top = `${this.graphHeight - legendHeight}px`;
    this.legend.resizeContainer(LEGEND_WIDTH, legendHeight, false, true);
  }

  plotPoints() {
    // determine whether to show the points, at the current zoom level
    let boundingBox = this.board.getBoundingBox();
    let zoomFactor = (BOUNDING_BOX[2] - BOUNDING_BOX[0]) / (boundingBox[2] - boundingBox[0]);
    let showLabels = (zoomFactor >= SUBJECT_LABELS_ZOOM_THRESHOLD);

    for (let subjectCode of this.subjects) {
      // plot raw score input
      let rawScore = this.props.subjects[subjectCode];
      if (rawScore) {
        let scaledScore = calculateScaledScore(rawScore, subjectCode, this.props.year);
        let point = this.board.create('point', [rawScore, scaledScore], {face: "cross", name: SUBJECTS[subjectCode], withLabel: true});
        point.label.setAttribute({offset: [10, -4]});
        if (!showLabels) point.setAttribute({withLabel: false});
        point.hasPoint = function(x, y) {return false;}; // disable highlighting
        this.points.push(point);
      }
    }
  }

  addZoomLevelListeners() {
    function zoomFactorChange(zoomFactor, previousZoomFactor, thresholdZoomFactor) {
      // tests whether the zoom factor has crossed the threshold (for optimisation purposes so no redundant attribute setting)
      if (zoomFactor >= thresholdZoomFactor) {
        return previousZoomFactor < thresholdZoomFactor;
      } else {
        return previousZoomFactor > thresholdZoomFactor;
      }
    }

    this.subjectsWithLabels = [];   // a list of points whose labels are visible

    // show/hide labels and/or legend depending on zoom level
    let previousZoomFactor = 0;   // set to zero so there is always a change in zoom at the start
    this.board.on('boundingbox', () => {
      const boundingBox = this.board.getBoundingBox();
      const zoomFactor = (BOUNDING_BOX[2] - BOUNDING_BOX[0]) / (boundingBox[2] - boundingBox[0]);
      if (zoomFactor.toFixed(3) === previousZoomFactor.toFixed(3)) return;  // only update if the zoom level changes (rounded due to imprecision)
      
      this.autoHideSubjectLabels();

      // show/hide legend once zoomed in enough (only for mobile)
      if (this.isMobile && zoomFactorChange(zoomFactor, previousZoomFactor, MOBILE_LEGEND_ZOOM_THRESHOLD)) {
        document.getElementById('jsxlegend').style.display = (zoomFactor >= MOBILE_LEGEND_ZOOM_THRESHOLD) ? 'none' : ''; // none is hidden, blank is shown
      }

      previousZoomFactor = zoomFactor;
    }); 
  }

  autoHideSubjectLabels() {
    // returns a tuple representing a rectangle of space [x, y, width, height]
    function getCoordinate(point) {
      /* These values include the point itself (whereas the current versions do not) so a larger area is considered occupied
      const xCoord = point.coords.scrCoords[1];
      const yCoord = point.coords.scrCoords[2];
      const width =  point.label.rendNode.offsetWidth + Math.abs(point.label.visProp.offset[0]);
      const height = point.label.rendNode.offsetHeight + Math.abs(point.label.visProp.offset[1]);   // only works because text below point
      */

      const xCoord = point.label.coords.scrCoords[1];
      const yCoord = point.label.coords.scrCoords[2];
      const width =  point.label.rendNode.offsetWidth;
      const height = point.label.rendNode.offsetHeight;
      return [xCoord, yCoord, width, height];
    }
    
    // only show labels if they don't overlap with others
    function isFreeSpace(coordinate, occupiedCoordinates) {
      const [xCoord, yCoord, width, height] = coordinate;
      for (const [minX, minY, maxWidth, maxHeight] of occupiedCoordinates) {
        const xCollision = (
          (xCoord >= minX && xCoord <= minX + maxWidth) || (xCoord + width >= minX && xCoord + width <= minX + maxWidth)  || // check if xCoord is within occupied space
          (minX >= xCoord && minX <= xCoord + width) || (minX + maxWidth >= xCoord && minX + maxWidth <= xCoord + width)     // check if occupied coordinate is within xCoord
        );
        const yCollision = (
          (yCoord >= minY && yCoord <= minY + maxHeight) || (yCoord + height >= minY && yCoord + height <= minY + maxHeight) ||
          (minY >= yCoord && minY <= yCoord + height) || (minY + maxHeight >= yCoord && minY + maxHeight <= yCoord + height)
          );
        if (xCollision && yCollision) return false;
      }
      return true;
    }


    let occupiedCoordinates = []; // a list of coordinate tuples that tracks which spaces are being occupied by labels
    // compute which spaces are occupied
    for (let point of this.subjectsWithLabels) {
      occupiedCoordinates.push(getCoordinate(point));
    }

    this.board.suspendUpdate();

    // first try to add new subject labels if there's space
    for (let point of this.points) {
      if (this.subjectsWithLabels.includes(point)) continue;

      const coordinate = getCoordinate(point);
      
      if (this.subjectsWithLabels.length < 1 || isFreeSpace(coordinate, occupiedCoordinates)) {
        point.setAttribute({withLabel: true});
        this.subjectsWithLabels.unshift(point);
        occupiedCoordinates.push(coordinate);
      } else {
        if (point.hasLabel) point.setAttribute({withLabel: false});
      }
    }

    // then delete subject labels if it's too full
    for (let point of this.subjectsWithLabels) {
      const coordinate = getCoordinate(point);
      const otherCoordinates = occupiedCoordinates.filter((coord) => {return coord[0] !== coordinate[0] || coord[1] !== coordinate[1] || coord[2] !== coordinate[2] || coord[3] !== coordinate[3];});
      if (!isFreeSpace(coordinate, otherCoordinates)) {
        point.setAttribute({withLabel: false});
        occupiedCoordinates = otherCoordinates;
        this.subjectsWithLabels = this.subjectsWithLabels.filter((subject) => {return subject !== point});
      }
    }

    this.board.unsuspendUpdate();
  }

  createMouseCoordinates() {
     // create coordinates at mouse
     let mouseCoordinates = this.board.create('point', [0, 0], {
      visible: false,
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
    mouseCoordinates.label.setAttribute({offset: [7, 13]}); // set offset of coordinates at mouse
    mouseCoordinates.label.setAttribute({cssClass: "mouseCoordinates"});

    // update position of mouse coordinates
    let previousCoordinates = [0, 0];   // tracks whether there has been a change in coordinates (only update on change for optimisation)
    let previouslyVisible = false;      // tracks whether coordinates were previously shown (for optimisation)
    let updateMouseCoordinates = () => {
      if (this.subjects.length < 1) return false;

      let coords = new JXG.Coords(COORDS_BY_SCREEN, this.board.getMousePosition(), this.board).usrCoords.slice(1);
      let nearestX = Math.round(coords[0]);

      if (nearestX >= -1 && nearestX <= 101) {
        // adds leeway so you don't have to get exactly 0 or 100
        if (nearestX <= 0) nearestX = 0;
        if (nearestX >= 100) nearestX = 100;  

        // pick the closest subject to select
        let closestSubject = this.subjects.reduce((subjectCode1, subjectCode2) => {  // get the subject with raw score closest to the cursor
          return (Math.abs(calculateScaledScore(nearestX, subjectCode1, this.props.year) - coords[1]) < Math.abs(calculateScaledScore(nearestX, subjectCode2, this.props.year) - coords[1])) ? subjectCode1 : subjectCode2;
        })
        let nearestY = calculateScaledScore(nearestX, closestSubject, this.props.year);

        // show coordinates if previously hidden
        if (!previouslyVisible) {
          this.board.suspendUpdate();
          mouseCoordinates.showElement();
          previouslyVisible = true;
        }

        // only update if the coordinates have actually changed
        let coordinates = [nearestX, nearestY];
        if (nearestX === previousCoordinates[0] && nearestY === previousCoordinates[1]) return false;
        previousCoordinates = coordinates;
        
        // move the point to the mouse and update it's name to be it's coordinate
        this.board.suspendUpdate();
        mouseCoordinates.moveTo(coordinates);
        mouseCoordinates.setAttribute({name: `(${nearestX.toFixed(0)}, ${nearestY.toFixed(2)})`});
        this.board.unsuspendUpdate();
      } else {
        if (previouslyVisible) {
          mouseCoordinates.hideElement();
          previouslyVisible = false;
        }
      }
    }
    this.board.on('touchstart', updateMouseCoordinates);
    this.board.on('pointermove', updateMouseCoordinates);
  }

  clearPoints() {
    // clear the points which show the raw score inputted but not the graphs. useful if only the raw score changes and not the subjects
    this.points = [];
    this.subjectsWithLabels = [];

    let objectsList = [...this.board.objectsList];
    for (let index = objectsList.length - 1; index >= 0; index -= 1) {
      let object = objectsList[index];
      if ((object.elType === "point" && object.Xjc !== null))
        this.board.removeObject(object.id);
    }
  }

  componentDidUpdate() {
    this.board.suspendUpdate();
    this.legend.suspendUpdate();

    let previousSubjects = [...this.subjects];
    this.subjects = Object.keys(this.props.subjects).filter((subjectCode) => {return this.props.subjects[subjectCode] !== undefined}); // this is a list, whereas this.props.subjects is an object
    this.subjectsHaveChanged = !(JSON.stringify(previousSubjects) === JSON.stringify(this.subjects));
    
    if (this.subjectsHaveChanged || this.year !== this.props.year) {
      this.year = this.props.year;  // track the year that was previously to check whether the year has changed
      this.clearBoard();
      if (this.subjects.length > 0) this.plotScalingFunctions();
    }
    if (this.subjectsHaveChanged) {
      this.clearLegend();
      if (this.subjects.length > 0) this.createLegend();
    }

    this.clearPoints();
    this.plotPoints();
    this.autoHideSubjectLabels();

    this.board.unsuspendUpdate();
    this.legend.unsuspendUpdate();
  }

  render() {
    this.isMobile = this.maxWidth < 400;

    this.maxWidth = document.querySelector('.section-inner').getBoundingClientRect().width;
    this.graphHeight = Math.abs(this.maxWidth * (BOUNDING_BOX[1] - BOUNDING_BOX[3]) / (BOUNDING_BOX[2] - BOUNDING_BOX[0]));  // ensures that 1x1 aspect ratio is maintained
    
    return(
      <div style={{position: "relative"}}>
        <div id="jsxgraph" style={{width: this.maxWidth, height: this.graphHeight}}></div>
        <div id="jsxlegend" style={{position: "absolute", top: this.graphHeight - 250 /* estimate, will be accurately calculated later */, right: 0, width: LEGEND_WIDTH, height: this.graphHeight, zIndex: -1}}></div>
      </div>
    );
  }
}