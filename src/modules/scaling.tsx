import './../css/scaling.css';
import { useEffect, useRef } from 'react';
import JXG, { COORDS_BY_SCREEN } from 'jsxgraph';

import { SubjectCode, Subjects } from '../types';
import { calculateScaledScore } from '../utility/atar_calculations';

import SUBJECTS from '../data/all_subjects.json';
import { getScalingData } from '../utility/data';


const COLORS = [
    'steelblue',
    'orangered',
    '#05b378', // green
    'darkviolet',
    'orange',
    'brown',
    'magenta'
];

const JSX_GRAPH_ELEMENT_ID = "jsxgraph";
const JSX_LEGEND_ELEMENT_ID = "jsxlegend";
const JSX_NAVBAR_ELEMENT_ID = "jsxgraph_navigationbar";

const BOUNDING_BOX = [-9, 103, 113, -6]; // min x, max y, max x, min y
const BOUNDING_BOX_LEGEND = [0, 120, 20, 0];

const LEGEND_WIDTH = 110;

const SUBJECT_LABELS_ZOOM_THRESHOLD = 1.7;
const MOBILE_HIDE_ELEMENTS_ZOOM_THRESHOLD = 8;

// Every JXG object you create should have a cssClass attribute value (from below)
// This ensures that they can be properly deleted when clearing the board
const OBJECTS_TO_CLEAR = {
    SUBJECT_SCORE: "subjectScore",
    SUBJECT_NAME: "subjectName",
    SUBJECT_FUNCTION: "subjectFunction"
};

// replace default font
JXG.Options.text.cssDefaultStyle = 'z-index: 0';
JXG.Options.text.highlightCssDefaultStyle = '';

type JXGObject = JXG.Text | JXG.Point | JXG.Line | JXG.Curve | JXG.Ticks;


interface ScalingGraphProps {
    subjects: Subjects,
    year: number
}

export default function ScalingGraph({ subjects, year }: ScalingGraphProps) {
    const subjectCodes = Object.keys(subjects) as SubjectCode[];

    const board = useRef({objectsList: []} as unknown as JXG.Board);
    const legend = useRef({} as JXG.Board);

    // this needs to be after the mouse coordinates is created so it is preserved
    const originalObjects = useRef([]) as {current: JXGObject[]};

    const prevSubjects = useRef([]) as {current: SubjectCode[]};
    const points = useRef([]) as {current: JXG.Point[]};
    const pointsWithLabels = useRef([]) as {current: JXG.Point[]};  // a list of points whose labels are visible
    const prevYear = useRef(2022) as {current: number};     // track the year that was previously to check whether the year has changed

    useEffect(() => {
        // Initialise the board and legend AFTER the initial render

        board.current = JXG.JSXGraph.initBoard("jsxgraph", {
            axis: true,
            maxFrameRate: 30,
            boundingbox: BOUNDING_BOX,
            maxBoundingBox: [-100, 200, 200, -100],
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
            navbar: {
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

        legend.current = JXG.JSXGraph.initBoard("jsxlegend", {
            boundingbox: BOUNDING_BOX_LEGEND,
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

        addZoomLevelListeners(); // this could be further optimised by only updating subject label listener, not whole legend listener
        createMouseCoordinates();

        originalObjects.current = [...board.current.objectsList as JXGObject[]];
        prevSubjects.current = [];
    }, []);

    function createLegend() {
        // Adds the subject names to the legend board and resizes the legend board size to fit

        const subjectsNames = subjectCodes.map((subjectCode) => { return SUBJECTS[subjectCode] });
        const longestSubjectName = subjectsNames.reduce((subject1, subject2) => { return (subject1.length > subject2.length) ? subject1 : subject2 });
        const numLines = Math.ceil(longestSubjectName.length / 12);
        const rowHeight = numLines * 9 + 10;
        const coordRatio = legend.current.canvasHeight / BOUNDING_BOX_LEGEND[1] // number of pixels per 1 unit on graph

        legend.current.create('legend', 
            [0, rowHeight * subjectCodes.length / coordRatio + 6], // min y and max y 
            { labels: subjectsNames, colors: COLORS, rowHeight: rowHeight }
        );
    }

    function addZoomLevelListeners() {
        // Adds an event listener to automatically show/hide features of graph based on zoom level

        function zoomFactorChange(zoomFactor: number, previousZoomFactor: number, thresholdZoomFactor: number) {
            // tests whether the zoom factor has crossed the threshold (for optimisation purposes so no redundant attribute setting)
            if (zoomFactor >= thresholdZoomFactor) {
                return previousZoomFactor < thresholdZoomFactor;
            } else {
                return previousZoomFactor > thresholdZoomFactor;
            }
        }

        function toggleElement(elementID: string, zoomFactor: number) {
            const element = document.getElementById(elementID);
                if (element) {
                    if (zoomFactor >= MOBILE_HIDE_ELEMENTS_ZOOM_THRESHOLD) {
                        element.classList.add('mobileHidden');
                    } else {
                        element.classList.remove('mobileHidden');
                    }
                }
        }

        pointsWithLabels.current = [];

        // initially hide navbar if mobile
        if (isMobile) {
            toggleElement(JSX_NAVBAR_ELEMENT_ID, Infinity);  // always hides navbar
        }

        let previousZoomFactor = 0;   // set to zero so there is always a change in zoom at the start
        let navbarVisible = false;
        board.current.on('boundingbox', () => {
            autoHideSubjectLabels();

            if (isMobile) {
                // show/hide labels and/or legend depending on zoom level
                const boundingBox = board.current.getBoundingBox();
                const zoomFactor = (BOUNDING_BOX[2] - BOUNDING_BOX[0]) / (boundingBox[2] - boundingBox[0]);

                // only update if the zoom level changes (rounded due to imprecision)
                if (zoomFactor.toFixed(3) !== previousZoomFactor.toFixed(3)) {
                    // show/hide elements they cross the zoom threshold
                    if (zoomFactorChange(zoomFactor, previousZoomFactor, MOBILE_HIDE_ELEMENTS_ZOOM_THRESHOLD)) {
                        toggleElement(JSX_LEGEND_ELEMENT_ID, zoomFactor);
                        // toggleElement(JSX_NAVBAR_ELEMENT_ID, zoomFactor);
                    }
                }

                // auto hide navbar if its hidden by x-axis
                const axisCoords: number[] = board.current.defaultAxes.x.point1.coords.scrCoords;  // returns tuple of 3: (0, x, y)
                if (axisCoords[2] < graphHeight && axisCoords[2] > graphHeight - 30) {
                    if (navbarVisible) {
                        toggleElement(JSX_NAVBAR_ELEMENT_ID, Infinity);  // always hides navbar
                        navbarVisible = false;
                    }
                } else {
                    if (!navbarVisible) {
                        // check first anyways for optimisation to prevent dom query
                        if (zoomFactor < MOBILE_HIDE_ELEMENTS_ZOOM_THRESHOLD) {
                            toggleElement(JSX_NAVBAR_ELEMENT_ID, zoomFactor);
                        }
                        navbarVisible = true;
                    }
                }

                previousZoomFactor = zoomFactor;
            }
        });
    }

    function autoHideSubjectLabels() {
        // Automatically hidies subject labels if they collide with other subject labels

        // returns a tuple representing a rectangle of space [x, y, width, height]
        function getCoordinate(point: JXG.Point) {
            /* These values include the point itself (whereas the current versions do not) so a larger area is considered occupied
            const xCoord = point.coords.scrCoords[1];
            const yCoord = point.coords.scrCoords[2];
            const width =  point.label.rendNode.offsetWidth + Math.abs(point.label.visProp.offset[0]);
            const height = point.label.rendNode.offsetHeight + Math.abs(point.label.visProp.offset[1]);   // only works because text below point
            */

            const xCoord = point.label.coords.scrCoords[1];
            const yCoord = point.label.coords.scrCoords[2];
            const width = point.label.rendNode.offsetWidth;
            const height = point.label.rendNode.offsetHeight;
            return [xCoord, yCoord, width, height];
        }

        // only show labels if they don't overlap with others
        function isFreeSpace(coordinate: number[], occupiedCoordinates: number[][]) {
            const [xCoord, yCoord, width, height] = coordinate;
            for (const [minX, minY, maxWidth, maxHeight] of occupiedCoordinates) {
                const xCollision = (
                    (xCoord >= minX && xCoord <= minX + maxWidth) 
                    || (xCoord + width >= minX && xCoord + width <= minX + maxWidth) // check if xCoord is within occupied space
                    || (minX >= xCoord && minX <= xCoord + width) 
                    || (minX + maxWidth >= xCoord && minX + maxWidth <= xCoord + width)     // check if occupied coordinate is within xCoord
                );
                const yCollision = (
                    (yCoord >= minY && yCoord <= minY + maxHeight) 
                    || (yCoord + height >= minY && yCoord + height <= minY + maxHeight) 
                    || (minY >= yCoord && minY <= yCoord + height) 
                    || (minY + maxHeight >= yCoord && minY + maxHeight <= yCoord + height)
                );
                if (xCollision && yCollision) return false;
            }
            return true;
        }


        let occupiedCoordinates = [] as number[][]; // a list of coordinate tuples that tracks which spaces are being occupied by labels
        // compute which spaces are occupied
        for (const point of pointsWithLabels.current) {
            occupiedCoordinates.push(getCoordinate(point));
        }

        board.current.suspendUpdate();

        // first try to add new subject labels if there's space
        for (const point of points.current) {
            if (pointsWithLabels.current.includes(point)) continue;

            const coordinate = getCoordinate(point);

            if (pointsWithLabels.current.length < 1 || isFreeSpace(coordinate, occupiedCoordinates)) {
                point.setAttribute({ withLabel: true });
                pointsWithLabels.current.unshift(point);
                occupiedCoordinates.push(coordinate);
            } else {
                if (point.hasLabel) point.setAttribute({ withLabel: false });
            }
        }

        // then delete subject labels if it's too full
        for (const point of pointsWithLabels.current) {
            const coordinate = getCoordinate(point);
            const otherCoordinates = occupiedCoordinates.filter((coord) => { 
                return coord[0] !== coordinate[0] 
                    || coord[1] !== coordinate[1] 
                    || coord[2] !== coordinate[2] 
                    || coord[3] !== coordinate[3]; 
            });
            if (!isFreeSpace(coordinate, otherCoordinates)) {
                point.setAttribute({ withLabel: false });
                occupiedCoordinates = otherCoordinates;
                pointsWithLabels.current = pointsWithLabels.current.filter(
                    (subject) => { return subject !== point }
                );
            }
        }

        board.current.unsuspendUpdate();
    }

    function createMouseCoordinates() {
        // Creates a point which follows the mouse position and shows the coordinates

        // create coordinates at mouse
        const mouseCoordinates = board.current.create('point', [0, 0], {
            visible: false,
            fixed: true,
            highlight: false,
            size: 2,
            fillColor: 'black',
            fillOpacity: 0.7,
            strokeWidth: 0,   // disable stroke so only fill is considered
            precision: {  // ensures always highlighted
                touch: 0,
                mouse: 0,
                pen: 0
            },
        });
        mouseCoordinates.label.setAttribute({ offset: [7, 13] });

        // update position of mouse coordinates
        let previousCoordinates = [0, 0];   // tracks whether there has been a change in coordinates (only update on change for optimisation)
        let previouslyVisible = false;      // tracks whether coordinates were previously shown (for optimisation)

        function updateMouseCoordinates() {
            // WARNING: for some reason, if this function accesses the props, they are out of date
            // so must use the values from useRef

            if (prevSubjects.current.length < 1) {
                if (previouslyVisible) {
                    mouseCoordinates.hideElement();
                    previouslyVisible = false;
                }
                return false;
            }

            const mouseCoords = new JXG.Coords(COORDS_BY_SCREEN, board.current.getMousePosition(), board.current).usrCoords.slice(1);
            let nearestX = Math.round(mouseCoords[0]);

            if (nearestX >= -1 && nearestX <= 101) {
                // adds leeway so you don't have to get exactly 0 or 100
                if (nearestX <= 0) nearestX = 0;
                if (nearestX >= 100) nearestX = 100;

                // pick the subject closest to the mouse
                const closestSubject = prevSubjects.current.reduce((subjectCode1, subjectCode2) => { 
                    return (Math.abs(calculateScaledScore(nearestX, subjectCode1, prevYear.current) - mouseCoords[1]) 
                        < Math.abs(calculateScaledScore(nearestX, subjectCode2, prevYear.current) - mouseCoords[1])) 
                        ? subjectCode1 : subjectCode2;
                })
                const nearestY = calculateScaledScore(nearestX, closestSubject, prevYear.current);

                // show coordinates if previously hidden
                if (!previouslyVisible) {
                    board.current.suspendUpdate();
                    mouseCoordinates.showElement();
                    previouslyVisible = true;
                }

                // only update if the coordinates have actually changed
                const coordinates = [nearestX, nearestY];
                if (nearestX === previousCoordinates[0] && nearestY === previousCoordinates[1]) return false;
                previousCoordinates = coordinates;

                // move the point to the mouse and update it's name to be it's coordinate
                board.current.suspendUpdate();
                mouseCoordinates.moveTo(coordinates);
                mouseCoordinates.setAttribute({ name: `(${nearestX.toFixed(0)}, ${nearestY.toFixed(2)})` });
                board.current.unsuspendUpdate();
            } else {
                if (previouslyVisible) {
                    mouseCoordinates.hideElement();
                    previouslyVisible = false;
                }
            }
        }

        board.current.on('touchstart', updateMouseCoordinates);
        board.current.on('pointermove', updateMouseCoordinates);
    }

    function clearBoard() {
        // Removes every object in the board but preserves the objects required to render a blank board

        points.current = [];
        pointsWithLabels.current = [];

        const objectsList = [...board.current.objectsList] as JXGObject[];
        for (let index = objectsList.length - 1; index >= 0; index -= 1) {
            const object = objectsList[index];
            if (Object.values(OBJECTS_TO_CLEAR).includes(object.visProp.cssclass as string)) {
                board.current.removeObject(object.id);
            }
        }
    }

    function clearPoints() {
        // Clear the points which show the raw score but not the functions. Useful if only the raw score changes and not the subjects

        points.current = [];
        pointsWithLabels.current = [];

        const objectsList = [...board.current.objectsList] as JXGObject[];
        for (let index = objectsList.length - 1; index >= 0; index -= 1) {
            const object = objectsList[index];
            if ((object.visProp.cssclass === OBJECTS_TO_CLEAR.SUBJECT_SCORE)) {
                board.current.removeObject(object.id);
            }
        }
    }

    function clearLegend() {
        // Deletes every object in the legend board

        const legendObjectsList = [...legend.current.objectsList] as JXGObject[];
        for (let index = legendObjectsList.length - 1; index >= 0; index -= 1) {
            const object = legendObjectsList[index];
            legend.current.removeObject(object.id);
        }
    }

    function plotScalingFunctions() {
        // Plots the scaling function for each subject

        for (const [subjectIndex, subjectCode] of subjectCodes.entries()) {  // entries on a list does enumerate
            // create function
            const scalingData = getScalingData(year);
            const a = scalingData[subjectCode]["a"];
            const b = scalingData[subjectCode]["b"];

            board.current.create('functiongraph', [function (x: number) {
                return (100 / (1 + Math.exp(-a * (x - b))));}, 0, 100], 
                { 
                    strokeColor: COLORS[subjectIndex % COLORS.length], // modulus ensures colours repeat if exhausted
                    cssClass: OBJECTS_TO_CLEAR.SUBJECT_FUNCTION,
                    highlight: false
                }
            );   
        }
    }

    function plotPoints() {
        // Plots the points (raw score) onto each subject scaling function

        // determine whether to show the points, at the current zoom level
        const boundingBox = board.current.getBoundingBox();
        const zoomFactor = (BOUNDING_BOX[2] - BOUNDING_BOX[0]) / (boundingBox[2] - boundingBox[0]);
        const showLabels = (zoomFactor >= SUBJECT_LABELS_ZOOM_THRESHOLD);

        for (const [subjectCode, rawScore] of Object.entries(subjects)) {
            // plot raw score input
            if (rawScore) {
                const scaledScore = calculateScaledScore(rawScore, subjectCode as SubjectCode, year);

                const point = board.current.create('point', [rawScore, scaledScore], { 
                    face: "cross", 
                    name: SUBJECTS[subjectCode as SubjectCode], 
                    withLabel: true, 
                    cssClass: OBJECTS_TO_CLEAR.SUBJECT_SCORE,
                    highlight: false,
                    fixed: true,
                }) as JXG.Point;
                points.current.push(point);
                
                // Create subject name label
                point.label.setAttribute({ offset: [10, -4], cssClass: OBJECTS_TO_CLEAR.SUBJECT_NAME, highlight: false });
                if (!showLabels) point.setAttribute({ withLabel: false });
            }
        }
    }

    useEffect(() => {
        board.current.suspendUpdate();
        legend.current.suspendUpdate();
    
        const prevSubjectsHaveChanged = !(JSON.stringify(prevSubjects.current) === JSON.stringify(subjectCodes));
        prevSubjects.current = subjectCodes;
    
        if (prevSubjectsHaveChanged || prevYear.current !== year) {
            prevYear.current = year;
            clearBoard();
            if (subjectCodes.length > 0) plotScalingFunctions();
        } else {
            clearPoints();
        }
        if (prevSubjectsHaveChanged) {
            clearLegend();
            if (subjectCodes.length > 0) createLegend();
        }
    
        plotPoints();
        autoHideSubjectLabels();
        
        board.current.unsuspendUpdate();
        legend.current.unsuspendUpdate();
    });

    let graphHeight = 500;
    let isMobile = false;

    const innerSectionElement = document.querySelector('.section-inner');
    if (innerSectionElement) {
        const maxWidth = innerSectionElement.getBoundingClientRect().width;
        graphHeight = Math.abs(   // ensures that 1x1 aspect ratio is maintained
            maxWidth * (BOUNDING_BOX[1] - BOUNDING_BOX[3]) / (BOUNDING_BOX[2] - BOUNDING_BOX[0]));
        isMobile = maxWidth < 576;
    }

    return (
        <div style={{ position: "relative" }}>
            <div id={JSX_GRAPH_ELEMENT_ID} style={{ width: "100%", height: graphHeight}}></div>
            <div id={JSX_LEGEND_ELEMENT_ID} style={{ 
                position: "absolute", 
                bottom: 0, 
                right: 0, 
                width: LEGEND_WIDTH, 
                height: graphHeight, 
                zIndex: -1 
            }}></div>
        </div>
    );
}