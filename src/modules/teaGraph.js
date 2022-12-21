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
                    data={[
                    {
                        x: Object.keys(ATARDATA),
                        y: Array(Object.keys(ATARDATA).length).fill(0),
                        text: Object.values(ATARDATA),
                        type: 'scatter',
                        textposition: "top center",
                        mode: 'markers+text',
                        hoverinfo: 'x',
                        hovertemplate: 'TEA: %{x:.2f} <extra></extra>',
                        marker: { 
                            symbol: "line-ns",
                            size: 10,
                            line: {
                                width: 1
                            }}
                    },
                    {
                        x: [this.props.tea],
                        y: [0],
                        text: ["You"],
                        type: 'scatter',
                        textposition: "bottom center",
                        mode: 'markers+text',
                        hoverinfo: 'x',
                        hovertemplate: '%{x:.2f} <extra></extra>',
                        marker: {
                            size: 10,
                            color: "#2684ff",
                        }
                    }
                    ]}
                    layout={{
                        title: {
                            // text: "TITLE"
                            font: {
                                size: 17
                            }
                        },
                        width: width, 
                        height: 150, 
                        dragmode: 'pan',
                        showlegend: false,
                        font: {
                            family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
                        },
                        hoverlabel: {
                            bgcolor: "2684ff"
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