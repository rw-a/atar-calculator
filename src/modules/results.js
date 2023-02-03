import React from 'react';
import SUBJECTS from './../data/2021_subjects.json';
import SCALINGDATA from './../data/2021_scaling_data.json';
import ATARDATA from './../data/2021_atar_data.json'

class ResultsRow extends React.Component {
	render() {
		return(
			<tr>
				<td>{SUBJECTS[this.props.code]}</td>
				<td className='text-center'>{this.props.rawScore}</td>
				<td className='text-center'>{this.props.scaledScore}</td>
				<td className='text-center'>{this.props.teaPotential}</td>
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

export function calculateScaledScore(rawScore, subjectCode) {
	rawScore = Number(rawScore);
	let a = Number(SCALINGDATA[subjectCode]["a"]);
	let b = Number(SCALINGDATA[subjectCode]["b"]);
	let c = Number(SCALINGDATA[subjectCode]["c"]);
	return a / (1 + Math.exp(-b * (rawScore - c)));
}

function mapRawToScaledScores(subjectRawScores) {
	// creates an object with keys being subjectCode and value being scaledScore
	let subjectScaledScores = {};
	let subjectCodes = Object.keys(subjectRawScores).filter((subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)});
	for (let subjectCode of subjectCodes) {
		let rawScore = subjectRawScores[subjectCode];
		if (rawScore.length > 0) { // only scale if there is an actual input. otherwise be blank
			subjectScaledScores[subjectCode] = calculateScaledScore(rawScore, subjectCode);
		} else {
			subjectScaledScores[subjectCode] = "";
		}
	}
	return subjectScaledScores;
}

export function calculateTeaFromSubjects(subjectRawScores) {
	let subjectScaledScores = mapRawToScaledScores(subjectRawScores);
	let scaledScores = Object.values(subjectScaledScores);
	let tea = calculateTeaFromScaledScores(scaledScores);
	return tea;
}
  
export default class ResultsTable extends React.Component {
	render() {
		let subjectRawScores = this.props.subjectRawScores;
		let subjectCodes = Object.keys(subjectRawScores).filter((subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)});
		let subjectScaledScores = mapRawToScaledScores(subjectRawScores);

		// sort the subjects
		subjectCodes.sort((a, b) => {
			// by scaled score
			return (subjectScaledScores[b] - subjectScaledScores[a]);
		});

		// generate the rows of the table
		let rows = [];
		for (let [subjectIndex, subjectCode] of subjectCodes.entries()) {
			let rawScore = subjectRawScores[subjectCode];
			
			if (rawScore === "") {
				var scaledScore = "";
				var teaPotential = "";
			} else {
				rawScore = Number(rawScore);
				scaledScore = subjectScaledScores[subjectCode].toFixed(2);
				if (rawScore < 100) {
					// tea potential is how much the scaled score could increase if your raw score increased by 1
					teaPotential = (calculateScaledScore(rawScore + 1, subjectCode) - scaledScore).toFixed(2);
					if (subjectIndex > 4) {
						let newScaledScore = calculateScaledScore(rawScore + 1, subjectCode);
						if (newScaledScore < subjectScaledScores[subjectCodes[4]]) {
							teaPotential = 0;	// if the new scaled score is less than the scaled score of the 5th subject, it still wouldn't increase TEA
						} else {
							teaPotential = (newScaledScore - subjectScaledScores[subjectCodes[4]]).toFixed(2);	// how much more the TEA would be than the 5th subject (since 5th is already contributing, must find difference)
						}
						
					}
				} else {
					teaPotential = 0;
				}
			}

			rows.push(
				<ResultsRow key={subjectCode} code={subjectCode} rawScore={rawScore} scaledScore={scaledScore} teaPotential={teaPotential}/>
			);
		}
		// if no subjects added, add blank boxes as placeholders
		if (rows.length < 1) {
			rows.push(
				<ResultsRow key="0" code={""} rawScore={""} scaledScore={""} teaPotential={""}/>
			);
		}

		// do the math
		let scaledScores = Object.values(subjectScaledScores);    // only the values, don't care about which subject
		let tea = calculateTeaFromScaledScores(scaledScores);
		let atar = calculateAtarFromTea(tea);
		
		return (
			<div>
				<div id="results">
					<div className='text-center'>
						<p className='fs-18px'>Estimated TEA</p>
						<p className='fs-4'>{tea.toFixed(2)}</p>
						<p className='text-small fst-italic'>Your top 5 scaled scores</p>
					</div>
					<div className='text-center'>
						<p className='fs-18px'>Estimated ATAR</p>
						<p className='fs-4'>{atar}</p>
						<p className='text-small fst-italic'>No data for ATARs below 97.60</p>
					</div>
				</div>
				<table>
					<thead>
						<tr className='text-center'>
							<th>Subject</th>
							<th>Raw Score</th>
							<th>Scaled Score</th>
							<th>TEA Potential 
								<div id="tea-potential-help">
									<img className='help-icon' alt="What is TEA Potential?" src={require('./../assets/help.svg').default}></img>
									<span className='help-tooltip'>How much your TEA would increase if the raw score increased by 1.</span>
								</div>
							</th>
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