import './../css/results.css';
import React from 'react';

import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { getAtarData, getScalingData, estimateAtarModel } from './data';
import SUBJECTS from './../data/all_subjects.json';

import help_button_img from './../assets/help.svg';


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

function calculateAtarFromTea(tea, year) {
	// calculate ATAR using TEA
	const atarData = getAtarData(year);
	let teaList = Object.keys(atarData);     // assumes that ATARDATA is already sorted in ascending TEA order
	for (let i = 0; i < teaList.length; i++) {
		let currentTEA = Number(teaList[i]);
		if (tea < currentTEA) {
			let maxATAR = atarData[currentTEA].toFixed(2);
			// console.log((Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2));

			if (i === 0) {
				// if TEA is below the lowest available datapoint
				let estimatedAtar = (Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2);
				if (estimatedAtar < maxATAR) {
					return `~${estimatedAtar}`;
				} else {
					return `<${maxATAR}`;
				}
			} else {
				let previousTEA = Number(teaList[i - 1]);
				let minATAR = atarData[previousTEA].toFixed(2);
				if (minATAR === maxATAR || minATAR === "99.95") {
					return minATAR;
				} else {
					// if the conservative method is not precise enough, try using the estimated atar to give a more precise answer
					if (maxATAR - minATAR > 0.5) {
						let estimatedAtar = (Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2);
						if (estimatedAtar >= minATAR && estimatedAtar <= maxATAR) {
							return `~${estimatedAtar}`;
						}
					}
					return `${minATAR}-${maxATAR}`;
				}
			}
		}
	}
	return "99.95";
}

export function calculateScaledScore(rawScore, subjectCode, year) {
	const scalingData = getScalingData(year);
	rawScore = Number(rawScore);
	let a = Number(scalingData[subjectCode]["a"]);
	let b = Number(scalingData[subjectCode]["b"]);
	return 100 / (1 + Math.exp(-a * (rawScore - b)));
}

function mapRawToScaledScores(subjectRawScores, year) {
	// creates an object with keys being subjectCode and value being scaledScore
	let subjectScaledScores = {};
	let subjectCodes = Object.keys(subjectRawScores).filter((subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)});
	for (let subjectCode of subjectCodes) {
		let rawScore = subjectRawScores[subjectCode];
		if (rawScore.length > 0) { // only scale if there is an actual input. otherwise be blank
			subjectScaledScores[subjectCode] = calculateScaledScore(rawScore, subjectCode, year);
		} else {
			subjectScaledScores[subjectCode] = "";
		}
	}
	return subjectScaledScores;
}

export function calculateTeaFromSubjects(subjectRawScores, year) {
	let subjectScaledScores = mapRawToScaledScores(subjectRawScores, year);
	let scaledScores = Object.values(subjectScaledScores);
	let tea = calculateTeaFromScaledScores(scaledScores);
	return tea;
}
  
export default class ResultsTable extends React.Component {
	render() {
		let subjectRawScores = this.props.subjectRawScores;
		let subjectCodes = Object.keys(subjectRawScores).filter((subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)});
		let subjectScaledScores = mapRawToScaledScores(subjectRawScores, this.props.year);

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
					teaPotential = (calculateScaledScore(rawScore + 1, subjectCode, this.props.year) - scaledScore).toFixed(2);
					if (subjectIndex > 4) {
						let newScaledScore = calculateScaledScore(rawScore + 1, subjectCode, this.props.year);
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
				<ResultsRow key="0" code={""} rawScore={"‎"} scaledScore={""} teaPotential={""}/>
			);
		}

		// do the math
		let scaledScores = Object.values(subjectScaledScores);    // only the values, don't care about which subject
		let tea = calculateTeaFromScaledScores(scaledScores);
		let atar = calculateAtarFromTea(tea, this.props.year);
		
		return (
			<div>
				<Stack direction="horizontal" className="justify-content-around">
					<div className='text-center'>
						<p className='fs-18px'>Estimated TEA
							<OverlayTrigger placement="top" overlay={<Tooltip>The sum of your top 5 scaled scores.</Tooltip>}>
								<Image className='help-icon' src={help_button_img} alt="Estimated TEA Tooltip"/>
							</OverlayTrigger>
						</p>
						<p className='fs-4'>{tea.toFixed(2)}</p>
					</div>
					<div className='text-center'>
						<p className='fs-18px'>Estimated ATAR</p>
						<p className='fs-4'>{atar}</p>
					</div>
				</Stack>
				<Table bordered size="sm" className="border-dark">
					<thead>
						<tr className='text-center'>
							<th>Subject</th>
							<th>Raw Score</th>
							<th>Scaled Score</th>
							<th>TEA Potential 
								<OverlayTrigger placement="top" overlay={<Tooltip>How much your TEA would increase if the raw score increased by 1.</Tooltip>}>
									<Image className='help-icon' src={help_button_img} alt="TEA Potential Tooltip"/>
								</OverlayTrigger>
							</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</Table>
			</div>
		);
	}
}