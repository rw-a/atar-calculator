import './../css/results.css';

import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { SubjectCode, Subjects, Score } from '../types';
import { mapRawToScaledScores, calculateScaledScore, 
	calculateTeaFromScaledScores, calculateAtarFromTea } from '../utility/atar_calculations';
import SUBJECTS from '../data/all_subjects.json';

import helpButtonImg from './../assets/help.svg';


const NUM_SUBJECTS_IN_TEA = 5;


interface ResultsRowProps {
	code: SubjectCode | "",			// union allows for placeholder row
	rawScore: Score | "‎",
	scaledScore: Score,
	teaPotential: Score,
}

function ResultsRow({code, rawScore, scaledScore, teaPotential}: ResultsRowProps) {
	let subjectName: string;
	if (code === "") {
		subjectName = "";
	} else {
		subjectName = SUBJECTS[code];
	}

	let scaledScoreDisplay: string;
	if (scaledScore === "") {
		scaledScoreDisplay = "";
	} else {
		scaledScoreDisplay = scaledScore.toFixed(2);
	}

	let teaPotentialDisplay: string;
	if (teaPotential === "") {
		teaPotentialDisplay = "";
	} else {
		teaPotentialDisplay = teaPotential.toFixed(2);
	}

	return(
		<tr>
			<td>{subjectName}</td>
			<td className='text-center'>{rawScore}</td>
			<td className='text-center'>{scaledScoreDisplay}</td>
			<td className='text-center'>{teaPotentialDisplay}</td>
		</tr>
	);
}


interface ResultsTableProps {
	year: number,
	subjects: Subjects,
}
  
export default function ResultsTable({year, subjects}: ResultsTableProps) {
	const subjectCodes = Object.keys(subjects) as SubjectCode[];
	const subjectScaledScores = mapRawToScaledScores(subjects, year);

	// sort the subjects
	subjectCodes.sort((a, b) => {
		// by scaled score
		return (Number(subjectScaledScores[b]) - Number(subjectScaledScores[a]));
	});

	// generate the rows of the table
	const rows = [];
	for (const [subjectIndex, subjectCode] of subjectCodes.entries()) {
		const rawScore = subjects[subjectCode];
		let scaledScore: Score;
		let teaPotential: Score;

		if (rawScore === "") {
			scaledScore = "";
			teaPotential = "";
		} else {
			scaledScore = subjectScaledScores[subjectCode];
			if (rawScore < 100) {
				// tea potential is how much the scaled score could increase if your raw score increased by 1
				teaPotential = calculateScaledScore(rawScore + 1, subjectCode, year) - Number(scaledScore);
				if (subjectIndex > NUM_SUBJECTS_IN_TEA - 1) {
					const newScaledScore = calculateScaledScore(rawScore + 1, subjectCode, year);
					const fifthSubjectScaledScore = Number(subjectScaledScores[subjectCodes[NUM_SUBJECTS_IN_TEA - 1]]);
					if (newScaledScore < fifthSubjectScaledScore) {
						// if the new scaled score is less than the scaled score of the 5th subject
						// then it still wouldn't increase TEA
						teaPotential = 0;	
					} else {
						// how much more the TEA would be than the 5th subject 
						// since 5th is already contributing, must find difference
						teaPotential = newScaledScore - fifthSubjectScaledScore;
					}
					
				}
			} else {
				teaPotential = 0;
			}
		}

		rows.push(
			<ResultsRow 
				key={subjectCode} 
				code={subjectCode} 
				rawScore={rawScore} 
				scaledScore={scaledScore} 
				teaPotential={teaPotential}
			/>
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
						<OverlayTrigger placement="top" overlay={
								<Tooltip>The sum of your top 5 scaled scores.</Tooltip>
							}>
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
							<OverlayTrigger placement="top" overlay={
									<Tooltip>How much your TEA would increase if the raw score increased by 1.</Tooltip>
								}>
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