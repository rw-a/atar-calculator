import React from 'react';
import Plot from 'react-plotly.js'
import ATARDATA from './../data/2021_atar_data.json'

export default class TeaGraph extends React.Component {
    render() {
        let width = Math.min(720, document.querySelector('#root').getBoundingClientRect().width - 40);

        return (
            <div>
                <h2>TEA to ATAR Map</h2>
                <Plot 
                    data={[{    // yes you need all three brackets
                        x: Object.keys(ATARDATA),
                        y: new Array(Object.keys(ATARDATA).length).fill(0),
                        text: Object.values(ATARDATA),
                        type: 'scatter',
                        textposition: 'top center',
                        mode: 'markers+text',
                        marker: { 
                            symbol: "line-ns",
                            size: 10,
                            line: {
                                width: 1
                            }},
                    }]}
                    layout={{
                        width: width, 
                        height: 240, 
                        font: {
                            family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
                        },
                        margin: {
                            b: 0,
                            l: 0,
                            r: 0,
                            t: 0
                        },
                        xaxis: {
                            domain: [0, 500],
                            // range: [1, 500],
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
                        scrollZoom: true
                    }}
                />
            </div>
        );
    }
}