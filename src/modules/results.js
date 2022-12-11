import React from 'react';
import SUBJECTS from './../data/2021_subjects.json';
import SCALINGDATA from './../data/2021_scaling_data.json';
import ATARDATA from './../data/2021_atar_data.json'

class ResultsRow extends React.Component {
	render() {
		return(
			<tr>
				<td id='subjects-row'>{SUBJECTS[this.props.code]}</td>
				<td className='score'>{this.props.rawScore}</td>
				<td className='score'>{this.props.scaledScore}</td>
			</tr>
		);
	}
}

function calculateTeaFromScaledScores(scaledScores) {
		// calculate the TEA by taking the top 5 scaled scores
		let tea = 0;
		let numSubjects = scaledScores.length;
		for (let i = 0; i < Math.min(5, numSubjects); i++) {
			let maxScaledScore = Math.max(...scaledScores);
			tea += maxScaledScore;

			// remove the max score from the list
			const index = scaledScores.indexOf(maxScaledScore);
			if (index > -1) { // only splice array when item is found
				scaledScores.splice(index, 1); // 2nd parameter means remove one item only
			}
		}
		return tea;
}

function calculateAtarFromTea(tea) {
	// calculate ATAR using TEA
	let teaList = Object.keys(ATARDATA);     // assumes that ATARDATA is already sorted in ascending TEA order
	for (let i = 0; i < teaList.length; i++) {
		let currentTEA = Number(teaList[i]);
		if (tea < currentTEA) {
			let maxATAR = ATARDATA[currentTEA].toFixed(2);

			if (i === 0) {
				// if TEA is below the lowest available datapoint
				return `<${maxATAR}`;
			} else {
				let previousTEA = Number(teaList[i - 1]);
				let minATAR = ATARDATA[previousTEA].toFixed(2);
				if (minATAR === maxATAR || minATAR === "99.95") {
					return minATAR;
				} else {
					return `${minATAR}-${maxATAR}`;
				}
			}
		}
	}
	return "99.95";
}
  
export default class ResultsTable extends React.Component {
	render() {
		let subjectRawScores = this.props.subjectRawScores;
		let subjectCodes = Object.keys(subjectRawScores).filter((subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)});

		// calculate the scaled scores
		let subjectScaledScores = {};
		for (let subjectCode of subjectCodes) {
			let rawScore = subjectRawScores[subjectCode];
			if (rawScore.length > 0) { // only scale if there is an actual input. otherwise be blank
				// calculate the scaled score
				rawScore = Number(rawScore);
				let a = Number(SCALINGDATA[subjectCode]["a"]);
				let b = Number(SCALINGDATA[subjectCode]["b"]);
				let c = Number(SCALINGDATA[subjectCode]["c"]);
				subjectScaledScores[subjectCode] = a / (1 + Math.exp(-b * (rawScore - c)));
			} else {
				subjectScaledScores[subjectCode] = "";
			}
		}

		// sort the subjects
		subjectCodes.sort((a, b) => {
			// by scaled score
			return (subjectScaledScores[b] - subjectScaledScores[a]);
		});

		// generate the rows of the table
		let rows = [];
		for (let subjectCode of subjectCodes) {
			let rawScore = subjectRawScores[subjectCode];
			let scaledScore = subjectScaledScores[subjectCode];
			scaledScore = (scaledScore ? Number(scaledScore).toFixed(2) : "");  // round the scaled score to 2 d.p.
			rows.push(
				<ResultsRow key={subjectCode} code={subjectCode} rawScore={rawScore} scaledScore={scaledScore} />
			);
		}
		// if no subjects added, add blank boxes as placeholders
		if (rows.length < 1) {
			rows.push(
				<ResultsRow key="0" code={""} rawScore={""} scaledScore={""} />
			);
		}

		// do the math
		let scaledScores = Object.values(subjectScaledScores);    // only the values, don't care about which subject
		let tea = calculateTeaFromScaledScores(scaledScores);
		let calculatedATAR = calculateAtarFromTea(tea);
		
		return (
			<div className='section'>
				<h2>Results</h2>
				<div id="results">
					<div className='results'>
						<p className='heading'>Estimated TEA</p>
						<p className='resultNumber'>{tea.toFixed(2)}</p>
						<p className='note'>Your top 5 scaled scores</p>
					</div>
					<div className='results'>
						<p className='heading'>Estimated ATAR</p>
						<p className='resultNumber'>{calculatedATAR}</p>
						<p className='note'>No data for ATARs below 97.60</p>
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>Subject</th>
							<th>Raw Score</th>
							<th>Scaled Score</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
}