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

const BOUNDING_BOX = [-9, 103, 113, -6]; // min x, max y, max x, min y

const LEGEND_WIDTH = 110;

const SUBJECT_LABELS_ZOOM_THRESHOLD = 1.7;
const MOBILE_LEGEND_ZOOM_THRESHOLD = 10;

// replace default font
JXG.Options.text.cssDefaultStyle = 'z-index: 0';
JXG.Options.text.highlightCssDefaultStyle = '';

type JXGObject = JXG.Text | JXG.Point | JXG.Line | JXG.Curve | JXG.Ticks;


interface ScalingGraphProps {
    subjects: Subjects,
    year: number
}

export default function ScalingGraph({ subjects, year }: ScalingGraphProps) {
    const board = useRef({objectsList: []} as unknown as JXG.Board);
    const legend = useRef({} as JXG.Board);

    useEffect(() => {
        board.current = JXG.JSXGraph.initBoard("jsxgraph", {
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

        addZoomLevelListeners(); // this could be further optimised by only updating subject label listener, not whole legend listener
        createMouseCoordinates();

        originalObjects.current = [...board.current.objectsList as JXGObject[]];
    }, []);

    const originalObjects = useRef([]) as {current: JXGObject[]}; // this needs to be after the mouse coordinates is created so it is preserved

    const prevPoints = useRef([]) as {current: JXG.Point[]};
    const prevSubjectsWithLabels = useRef([]) as {current: JXG.Point[]};  // a list of points whose labels are visible
    const prevSubjects = useRef([]) as {current: SubjectCode[]};
    const prevYear = useRef(2022) as {current: number};

    function clearBoard() {
        const objectsList = [...board.current.objectsList] as JXGObject[];
        for (let index = objectsList.length - 1; index >= 0; index -= 1) {
            const object = objectsList[index];
            if (object.elType === "line" || object.elType === "curve" 
            || (object.elType === "text" && object.htmlStr.length > 3 && object.visProp.cssclass !== "mouseCoordinates") 
            || (object.elType === "point" && object.Xjc !== null) || !originalObjects.current.includes(object))
                board.current.removeObject(object.id);
        }
    }

    function plotScalingFunctions() {
        for (const [subjectIndex, subjectCode] of prevSubjects.current.entries()) {  // entries on a list does enumerate
            // create function
            const scalingData = getScalingData(year);
            const a = scalingData[subjectCode]["a"];
            const b = scalingData[subjectCode]["b"];

            const subjectFunction = board.current.create('functiongraph', [function (x: number) {
                return (100 / (1 + Math.exp(-a * (x - b))));
            }, 0, 100], { strokeColor: COLORS[subjectIndex % COLORS.length] });   // modulus ensures colours repeat if exhausted

            subjectFunction.hasPoint = function (x, y) { return false; }; // disable highlighting
        }
    }

    function clearLegend() {
        const legendObjectsList = [...legend.current.objectsList] as JXGObject[];
        for (let index = legendObjectsList.length - 1; index >= 0; index -= 1) {
            const object = legendObjectsList[index];
            legend.current.removeObject(object.id);
        }
    }

    function createLegend() {
        const subjectsNames = prevSubjects.current.map((subjectCode: SubjectCode) => { return SUBJECTS[subjectCode] });
        const longestSubjectName = subjectsNames.reduce((subject1, subject2) => { return (subject1.length > subject2.length) ? subject1 : subject2 });
        const numLines = Math.ceil(longestSubjectName.length / 12);
        const rowHeight = numLines * 9 + 10;

        const newLegend = legend.current.create('legend', [0, 100], { labels: subjectsNames, colors: COLORS, rowHeight: rowHeight });

        const legendHeight = newLegend.lines.at(-1).getTextAnchor().scrCoords.at(-1) + rowHeight + maxWidth / 30;
        document.getElementById('jsxlegend').style.top = `${graphHeight - legendHeight}px`;
        legend.current.resizeContainer(LEGEND_WIDTH, legendHeight, false, true);
    }

    function plotPoints() {
        // determine whether to show the points, at the current zoom level
        const boundingBox = board.current.getBoundingBox();
        const zoomFactor = (BOUNDING_BOX[2] - BOUNDING_BOX[0]) / (boundingBox[2] - boundingBox[0]);
        const showLabels = (zoomFactor >= SUBJECT_LABELS_ZOOM_THRESHOLD);

        for (const subjectCode of prevSubjects.current) {
            // plot raw score input
            const rawScore = subjects[subjectCode];
            if (rawScore) {
                const scaledScore = calculateScaledScore(rawScore, subjectCode, year);
                const point = board.current.create('point', [rawScore, scaledScore], { face: "cross", name: SUBJECTS[subjectCode], withLabel: true });
                point.label.setAttribute({ offset: [10, -4] });
                if (!showLabels) point.setAttribute({ withLabel: false });
                point.hasPoint = function (x, y) { return false; }; // disable highlighting
                prevPoints.current.push(point);
            }
        }
    }

    function addZoomLevelListeners() {
        function zoomFactorChange(zoomFactor: number, previousZoomFactor: number, thresholdZoomFactor: number) {
            // tests whether the zoom factor has crossed the threshold (for optimisation purposes so no redundant attribute setting)
            if (zoomFactor >= thresholdZoomFactor) {
                return previousZoomFactor < thresholdZoomFactor;
            } else {
                return previousZoomFactor > thresholdZoomFactor;
            }
        }

        prevSubjectsWithLabels.current = [];

        // show/hide labels and/or legend depending on zoom level
        let previousZoomFactor = 0;   // set to zero so there is always a change in zoom at the start
        board.current.on('boundingbox', () => {
            const boundingBox = board.current.getBoundingBox();
            const zoomFactor = (BOUNDING_BOX[2] - BOUNDING_BOX[0]) / (boundingBox[2] - boundingBox[0]);
            if (zoomFactor.toFixed(3) === previousZoomFactor.toFixed(3)) return;  // only update if the zoom level changes (rounded due to imprecision)

            autoHideSubjectLabels();

            // show/hide legend once zoomed in enough (only for mobile)
            if (isMobile && zoomFactorChange(zoomFactor, previousZoomFactor, MOBILE_LEGEND_ZOOM_THRESHOLD)) {
                document.getElementById('jsxlegend').style.display = (zoomFactor >= MOBILE_LEGEND_ZOOM_THRESHOLD) ? 'none' : ''; // none is hidden, blank is shown
            }

            previousZoomFactor = zoomFactor;
        });
    }

    function autoHideSubjectLabels() {
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
        for (const point of prevSubjectsWithLabels.current) {
            occupiedCoordinates.push(getCoordinate(point));
        }

        board.current.suspendUpdate();

        // first try to add new subject labels if there's space
        for (const point of prevPoints.current) {
            if (prevSubjectsWithLabels.current.includes(point)) continue;

            const coordinate = getCoordinate(point);

            if (prevSubjectsWithLabels.current.length < 1 || isFreeSpace(coordinate, occupiedCoordinates)) {
                point.setAttribute({ withLabel: true });
                prevSubjectsWithLabels.current.unshift(point);
                occupiedCoordinates.push(coordinate);
            } else {
                if (point.hasLabel) point.setAttribute({ withLabel: false });
            }
        }

        // then delete subject labels if it's too full
        for (const point of prevSubjectsWithLabels.current) {
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
                prevSubjectsWithLabels.current = prevSubjectsWithLabels.current.filter(
                    (subject) => { return subject !== point }
                );
            }
        }

        board.current.unsuspendUpdate();
    }

    function createMouseCoordinates() {
        // create coordinates at mouse
        const mouseCoordinates = board.current.create('point', [0, 0], {
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
        mouseCoordinates.label.setAttribute({ offset: [7, 13] }); // set offset of coordinates at mouse
        mouseCoordinates.label.setAttribute({ cssClass: "mouseCoordinates" });

        // update position of mouse coordinates
        let previousCoordinates = [0, 0];   // tracks whether there has been a change in coordinates (only update on change for optimisation)
        let previouslyVisible = false;      // tracks whether coordinates were previously shown (for optimisation)
        const updateMouseCoordinates = () => {
            if (prevSubjects.current.length < 1) return false;

            const coords = new JXG.Coords(COORDS_BY_SCREEN, board.current.getMousePosition(), board.current).usrCoords.slice(1);
            let nearestX = Math.round(coords[0]);

            if (nearestX >= -1 && nearestX <= 101) {
                // adds leeway so you don't have to get exactly 0 or 100
                if (nearestX <= 0) nearestX = 0;
                if (nearestX >= 100) nearestX = 100;

                // pick the closest subject to select
                const closestSubject = prevSubjects.current.reduce((subjectCode1, subjectCode2) => {  // get the subject with raw score closest to the cursor
                    return (Math.abs(calculateScaledScore(nearestX, subjectCode1, year) - coords[1]) 
                        < Math.abs(calculateScaledScore(nearestX, subjectCode2, year) - coords[1])) 
                        ? subjectCode1 : subjectCode2;
                })
                const nearestY = calculateScaledScore(nearestX, closestSubject, year);

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

    function clearPoints() {
        // clear the points which show the raw score inputted but not the graphs. useful if only the raw score changes and not the subjects
        prevPoints.current = [];
        prevSubjectsWithLabels.current = [];

        const objectsList = [...board.current.objectsList] as JXGObject[];
        for (let index = objectsList.length - 1; index >= 0; index -= 1) {
            const object = objectsList[index];
            if ((object.elType === "point" && object.Xjc !== null))
                board.current.removeObject(object.id);
        }
    }

    useEffect(() => {
        board.current.suspendUpdate();
        legend.current.suspendUpdate();
    
        const previousSubjects = [...prevSubjects.current];
        prevSubjects.current = Object.keys(subjects) as SubjectCode[];
        const prevSubjectsHaveChanged = !(JSON.stringify(previousSubjects) === JSON.stringify(prevSubjects));
    
        if (prevSubjectsHaveChanged || prevYear.current !== year) {
            prevYear.current = year;  // track the year that was previously to check whether the year has changed
            clearBoard();
            if (prevSubjects.current.length > 0) plotScalingFunctions();
        }
        if (prevSubjectsHaveChanged) {
            clearLegend();
            if (prevSubjects.current.length > 0) createLegend();
        }
    
        clearPoints();
        plotPoints();
        autoHideSubjectLabels();
    
        board.current.unsuspendUpdate();
        legend.current.unsuspendUpdate();
    });

    const maxWidth = document.querySelector('.section-inner').getBoundingClientRect().width;
    const isMobile = maxWidth < 400;
    const graphHeight = Math.abs(maxWidth * (BOUNDING_BOX[1] - BOUNDING_BOX[3]) / (BOUNDING_BOX[2] - BOUNDING_BOX[0]));  // ensures that 1x1 aspect ratio is maintained

    return (
        <div style={{ position: "relative" }}>
            <div id="jsxgraph" style={{ width: maxWidth, height: graphHeight }}></div>
            <div id="jsxlegend" style={{ position: "absolute", top: graphHeight - 250 /* estimate, will be accurately calculated later */, right: 0, width: LEGEND_WIDTH, height: graphHeight, zIndex: -1 }}></div>
        </div>
    );
}