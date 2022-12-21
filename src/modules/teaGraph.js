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
                        x: [1, 2, 3],
                        y: [2, 6, 3],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'red'},
                    }]}
                    layout={{
                        width: width, 
                        height: 240, 
                        title: 'A Fancy Plot'
                    }}
                    config={{
                        scrollZoom: true
                    }}
                />
            </div>
        );
    }
}