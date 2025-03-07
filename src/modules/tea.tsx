import React from 'react';
import Plotly from 'plotly.js/dist/plotly-tiny.js'
import createPlotlyComponent from 'react-plotly.js/factory'
import { getAtarData } from '../utility/data';

const Plot = createPlotlyComponent(Plotly);

export default class TeaGraph extends React.Component {
    render() {
        const atarData = getAtarData(this.props.year);
        let width = document.querySelector('.section-inner').getBoundingClientRect().width;

        let data = [
            {
                x: Object.keys(atarData),
                y: Array(Object.keys(atarData).length).fill(0),
                text: Object.values(atarData),
                type: 'scatter',
                textposition: "top center",
                mode: 'markers+text',
                hoverinfo: 'x',
                hovertemplate: 'TEA: %{x:.2f} <extra></extra>', // extra with blank innerText removes the trace name
                marker: { 
                    symbol: "line-ns",
                    size: 10,
                    line: {
                        width: 1
                    }
                },
            },
            {
                x: [this.props.tea],
                y: [0],
                text: ["You"],
                type: 'scatter',
                textposition: "bottom center",
                mode: 'markers+text',
                hoverinfo: 'x',
                hovertemplate: 'TEA: %{x:.2f} <extra></extra>',
                marker: {
                    size: 10,
                    color: "#2684ff",
                }
            }
        ];

        // // if two teas of an atar is known, fill the region between them green (confirmed ATARs)
        let atars = Object.values(atarData);
        let teas = Object.keys(atarData);
        for (let i = 0; i < atars.length - 1; i++) {
            if (atars[i] === atars[i + 1]) {    // if two datapoints exist for an atar
                data.push(
                    {
                        x: [teas[i], teas[i + 1], teas[i + 1], teas[i]],
                        y: [0.1, 0.1, -0.1, -0.1],
                        type: 'scatter',
                        mode: 'markers',
                        hoverinfo: 'none',
                        fill: 'tozeroy',
                        fillcolor: 'rgba(44, 160, 44, 0.3)',
                        marker: {
                            opacity: 0  // hide markers
                        }
                    }
                );
                i += 1;     // skip the next one because already tested
            }
        }

        return (
            <div>
                <p className='text-small fst-italic'>Shows how your TEA (bottom numbers) translates into an ATAR (top numbers). If your point is in a green region, your exact ATAR is known (if you had been in the {this.props.year} cohort). If your point is not in a green region, your ATAR is ambiguous and a range or approximation is given.</p>
                <Plot 
                    data={data}
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
                            range: [this.props.tea - 1.5, this.props.tea + 1.5],      // starting zoom, should update based on predicted ATAR
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
                            fixedrange: true,
                            linewidth: 0,
                            linecolor: '#ffffff'
                        }
                    }}
                    config={{
                        scrollZoom: true,
                        displaylogo: false,
                        doubleClick: 'reset',
                        // displayModeBar: false,
                        modeBarButtons: [[
                            'toImage',
                        ], [
                            'zoomIn2d',
                            'zoomOut2d',
                        ], [
                            {
                                name: 'myResetScale2d',
                                title: 'Reset axes',
                                icon: Plotly.Icons.home,
                                click: (gd) => {
                                    Plotly.relayout(gd, 'xaxis.range', [this.props.tea - 1.5, this.props.tea + 1.5])
                                }
                            }
                        ]]
                    }}
                />
            </div>
        );
    }
}