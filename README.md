# ATAR Calculator for the QCE System
## Disclaimer
- This service is provided “as is” and takes no liability for damages arising out of its use.
- Neither QTAC nor QCAA endorse or have any involvement in any material appearing on this website.
- Prediction relies on extrapolation and is based only on historical data (2021). **It is inherently inaccurate.**
- No data is available for ATARs below 97.60.
- May crush your hopes and dreams or give you (more) depression, apathy, or overconfidence.
- Please do not completely throw away your *sixth subject*. You may never know what will happen.
- **Please keep trying, regardless of the prediction**. This is only an approximate indicator of how you’re going right now :)
## Usage
1. Visit the [calculator website](https://rw-a.github.io/atar-calculator/).
2. Input your raw scores for each subject. If you do not have your score out of 100, you may have to extrapolate.
 - **Warning:** extrapolating linearly on your current Internal Assessments may not be accurate. External exams are usually harder.
3. The calculator will scale them for you using a model based on 2021 scaling data.
4. The calculator will estimate your TEA (the sum of your 5 highest scaled scores).
5. The calculator will try to determine your ATAR using your estimated TEA (using data collected by hand of people's raw score and ATAR).
## Info
- Based on 2021 scaling data, sourced from the [QTAC ATAR Report 2021](https://www.qtac.edu.au/wp-content/uploads/2022/02/QTAC-ATAR-Report-2021.pdf).
- Scaling data was extrapolated using logistic regression models on Desmos. The models can be found on [here](https://www.desmos.com/calculator/ggjgw4hwma).
- Designed only for the QCE system.
- Website built using [React](https://reactjs.org/).
