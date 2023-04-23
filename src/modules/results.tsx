import './../css/results.css';
import React from 'react';

import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { SubjectCode, Score, SubjectScores } from '../types';
import { getAtarData, getScalingData, estimateAtarModel } from './data';
import SUBJECTS from '../data/all_subjects.json';

import helpButtonImg from './../assets/help.svg';


interface ResultsRowProps {
	code: SubjectCode,
	rawScore: Score,
	scaledScore: Score,
	teaPotential: Score,
}

function ResultsRow({code, rawScore, scaledScore, teaPotential}: ResultsRowProps) {
	return(
		<tr>
			<td>{SUBJECTS[code]}</td>
			<td className='text-center'>{rawScore}</td>
			<td className='text-center'>{scaledScore}</td>
			<td className='text-center'>{teaPotential}</td>
		</tr>
	);
}

function calculateTeaFromScaledScores(scaledScoresAll: Score[]): number {
		const scaledScores = scaledScoresAll.filter((scaledScore) => scaledScore !== "") as number[];

		// calculate the TEA by taking the top 5 scaled scores
		let tea: Score = 0;
		const numSubjects = scaledScores.length;
		for (let i = 0; i < Math.min(5, numSubjects); i++) {
			const maxScaledScore = Math.max(...scaledScores);
			tea += maxScaledScore;

			// remove the max score from the list
			const index = scaledScores.indexOf(maxScaledScore);
			if (index > -1) { // only splice array when item is found
				scaledScores.splice(index, 1); // 2nd parameter means remove one item only
			}
		}
		return tea;
}

function calculateAtarFromTea(tea: number, year: number): string {
	// calculate ATAR using TEA
	const atarData = getAtarData(year);
	const teaList = Object.keys(atarData);     // assumes that ATARDATA is already sorted in ascending TEA order
	for (let i = 0; i < teaList.length; i++) {
		const currentTEA = Number(teaList[i]);
		if (tea < currentTEA) {
			const maxATAR = atarData[currentTEA].toFixed(2);
			// console.log((Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2));

			if (i === 0) {
				// if TEA is below the lowest available datapoint
				const estimatedAtar = (Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2);
				if (estimatedAtar < maxATAR) {
					return `~${estimatedAtar}`;
				} else {
					return `<${maxATAR}`;
				}
			} else {
				const previousTEA = teaList[i - 1];
				const minATAR = atarData[previousTEA].toFixed(2);
				if (minATAR === maxATAR || minATAR === "99.95") {
					return minATAR;
				} else {
					// if the conservative method is not precise enough, 
					// try using the estimated atar to give a more precise answer
					if (Number(maxATAR) - Number(minATAR) > 0.5) {
						const estimatedAtar = (Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2);
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

export function calculateScaledScore(rawScore: number, subjectCode: SubjectCode, year: number) {
	const scalingData = getScalingData(year);
	const a = Number(scalingData[subjectCode]["a"]);
	const b = Number(scalingData[subjectCode]["b"]);
	return 100 / (1 + Math.exp(-a * (rawScore - b)));
}

function mapRawToScaledScores(subjectRawScores: SubjectScores, year: number) {
	// creates an object with keys being subjectCode and value being scaledScore
	const subjectScaledScores = {};
	const subjectCodes = Object.keys(subjectRawScores).filter(
		(subjectCode) => {return (subjectRawScores[subjectCode as SubjectCode] !== undefined)}
	) as SubjectCode[];
	for (const subjectCode of subjectCodes) {
		const rawScore = subjectRawScores[subjectCode];
		if (rawScore || rawScore === 0) { // only scale if there is an actual input. otherwise be blank
			subjectScaledScores[subjectCode] = calculateScaledScore(rawScore, subjectCode, year);
		} else {
			subjectScaledScores[subjectCode] = "";
		}
	}
	return subjectScaledScores;
}

export function calculateTeaFromSubjects(subjectRawScores: SubjectScores, year: number) {
	const subjectScaledScores = mapRawToScaledScores(subjectRawScores, year);
	const scaledScores = Object.values(subjectScaledScores);
	const tea = calculateTeaFromScaledScores(scaledScores);
	return tea;
}


interface ResultsTableProps {
	year: number,
	subjectRawScores: SubjectScores,
}
  
export default function ResultsTable({year, subjectRawScores}: ResultsTableProps) {
	const subjectCodes = Object.keys(subjectRawScores).filter(
		(subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)}
	);
	const subjectScaledScores = mapRawToScaledScores(subjectRawScores, year);

	// sort the subjects
	subjectCodes.sort((a, b) => {
		// by scaled score
		return (subjectScaledScores[b] - subjectScaledScores[a]);
	});

	// generate the rows of the table
	const rows = [];
	for (let [subjectIndex, subjectCode] of subjectCodes.entries()) {
		let rawScore = subjectRawScores[subjectCode];
		let scaledScore;
		let teaPotential;

		if (rawScore === "") {
			scaledScore = "";
			teaPotential = "";
		} else {
			rawScore = Number(rawScore);
			scaledScore = subjectScaledScores[subjectCode].toFixed(2);
			if (rawScore < 100) {
				// tea potential is how much the scaled score could increase if your raw score increased by 1
				teaPotential = (calculateScaledScore(rawScore + 1, subjectCode, year) - scaledScore).toFixed(2);
				if (subjectIndex > 4) {
					const newScaledScore = calculateScaledScore(rawScore + 1, subjectCode, year);
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
	const scaledScores = Object.values(subjectScaledScores);    // only the values, don't care about which subject
	const tea = calculateTeaFromScaledScores(scaledScores);
	const atar = calculateAtarFromTea(tea, year);
	
	return (
		<div>
			<Stack direction="horizontal" className="justify-content-around">
				<div className='text-center'>
					<p className='fs-18px'>Estimated TEA
						<OverlayTrigger placement="top" overlay={<Tooltip>The sum of your top 5 scaled scores.</Tooltip>}>
							<Image className='help-icon' src={helpButtonImg} alt="Estimated TEA Tooltip"/>
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
								<Image className='help-icon' src={helpButtonImg} alt="TEA Potential Tooltip"/>
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