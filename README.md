# ATAR Calculator for Queensland (QCE)
Visit the calculator website here: **https://rw-a.github.io/atar-calculator/**

## Disclaimer
- This service is provided “as is” and takes no liability for damages arising out of its use.
- Neither QTAC nor QCAA endorse or have any involvement in any material appearing on this website.
- Prediction relies on extrapolation and is based only on historical data (2021) so *it is inherently inaccurate.*
- No data is available for ATARs below 97.60. If you would like to contribute data, please contact me.
- May crush your hopes and dreams or give you (more) depression, apathy, or overconfidence. *Please keep trying, regardless of the prediction*. This is only an approximate indicator of how you’re going right now :)

## Usage
1. Visit the [calculator website](https://rw-a.github.io/atar-calculator/).
2. Input your raw scores for each subject. If you do not have your score out of 100, you may have to extrapolate (*Warning:* extrapolating linearly on your current internal assessments may not be accurate. External exams are usually harder).
3. The calculator will scale them for you using a model based on 2021 scaling data. The scaling models are shown in a graph at the bottom.
4. The calculator will estimate your TEA (the sum of your 5 highest scaled scores).
5. The calculator will predict your ATAR using your estimated TEA.
6. The calculator will also calculate your TEA potential. This is how much your TEA would increase if your raw score of that subject increased by 1 (the higher the TEA potential, the more 'value' it is to increase your raw score on that subject).

## Info
- Based on 2021 scaling data, sourced from the [QTAC ATAR Report 2021](https://www.qtac.edu.au/wp-content/uploads/2022/02/QTAC-ATAR-Report-2021.pdf).
- Scaling data was extrapolated using logistic regression models on Desmos. The models are also graphed and shown at the bottom of the page.
- Designed only for the QCE system.
- Website built using [React](https://reactjs.org/).

## Dependencies
This uses a custom bundle of Plotly.js. Once all regular npm packages are installed, run:
```
cd node_modules/plotly.js
npm i
npm run custom-bundle -- --traces scatter --transforms none --out tiny --unminified
```
