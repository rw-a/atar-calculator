import React from 'react';
import Plot from 'react-plotly.js'
import ATARDATA from './../data/2021_atar_data.json'

export default class TeaGraph extends React.Component {
    render() {
        let width = Math.min(720, document.querySelector('#root').getBoundingClientRect().width - 40);
        
        /* alternating text positions
        let textPositions = [];
        let markerPositions = [];
        for (let i = 0; i < Object.keys(ATARDATA).length; i++) {
            textPositions.push(["top center", "bottom center"][i % 2]);
            markerPositions.push([0.1, -0.1][i % 2]);
        } */

        return (
            <div>
                <h2>TEA to ATAR Map</h2>
                <Plot 
                    data={[{    // yes you need all three brackets
                        x: Object.keys(ATARDATA),
                        y: Array(Object.keys(ATARDATA).length).fill(0),
                        // y: markerPositions,
                        text: Object.values(ATARDATA),
                        type: 'scatter',
                        // textposition: textPositions,
                        textposition: "top center",
                        mode: 'markers+text',
                        marker: { 
                            symbol: "line-ns",
                            size: 10,
                            line: {
                                width: 1
                            }}
                    }]}
                    layout={{
                        title: {
                            // text: "ATAR",
                            font: {
                                size: 17
                            }
                        },
                        width: width, 
                        height: 150, 
                        dragmode: 'pan',
                        font: {
                            family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
                        },
                        margin: {
                            b: 50,
                            l: 0,
                            r: 0,
                            t: 10
                        },
                        xaxis: {
                            title: {
                                text: "TEA",
                                font: {
                                    size: 17
                                }
                            },
                            dtick: 1,           // does nothing?
                            domain: [0, 500],
                            range: [486, 490],      // starting zoom, should update based on predicted ATAR
                            // showgrid: false,
                            // gridcolor: "#000000",
                            ticks: "outside",
                            ticklen: 10
                        },
                        yaxis: {
                            range: [-1, 1],
                            showgrid: false,
                            zeroline: true,
                            showticklabels: false,
                            fixedrange: true
                        }
                    }}
                    config={{
                        scrollZoom: true,
                        displaylogo: false,
                        // displayModeBar: false,
                        modeBarButtonsToRemove: ["select2d", "lasso2d"]
                    }}
                />
            </div>
        );
    }
}