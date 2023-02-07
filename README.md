# ATAR Calculator for Queensland (QCE)
Visit the calculator website here: **https://rw-a.github.io/atar-calculator/**

## Disclaimer
- This service is provided “as is” and takes no liability for damages arising out of its use.
- Neither QTAC nor QCAA endorse or have any involvement in any material appearing on this website.
- Prediction relies on extrapolation and is based only on historical data so it is inherently inaccurate.

## Usage
1. Visit the [calculator website](https://rw-a.github.io/atar-calculator/).
2. Input your raw scores for each subject. If you do not have your score out of 100, you may have to extrapolate (extrapolating linearly on your current internal assessments may not be accurate as external exams are usually harder).
3. The calculator will scale them for you using a regression model of the scaling data. You can see these models in the "Scaling".
4. The calculator will estimate your TEA (the sum of your 5 highest scaled scores).
5. The calculator will predict your ATAR using your estimated TEA. You can see how TEAs are converted to ATARs in the "TEA" tab.
6. The calculator will also calculate your TEA potential. This is how much your TEA would increase if your raw score of that subject increased by 1 (the higher the TEA potential, the more 'value' it is to increase your raw score on that subject).

## Dependencies
This uses a custom bundle of Plotly.js. Once all regular npm packages are installed, run:
```
cd node_modules/plotly.js
npm i
npm run custom-bundle -- --traces scatter --transforms none --out tiny --unminified
```
