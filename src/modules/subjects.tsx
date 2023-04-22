import './../css/subjects.css';
import React from 'react';
import Select from 'react-select';

import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { getSubjects } from './data';
import SUBJECTS from '../data/all_subjects.json';

import helpButtonImg from './../assets/help.svg';
import saveButtonImg from './../assets/save.svg';
import saveButtonImgFilled from './../assets/save_filled.svg';


export interface Subjects {
	[key: string]: string | undefined
}


interface SubjectNameProps {
	name: string,
	year: number
}

function SubjectName({name, year}: SubjectNameProps) {
	return (
		<span className="me-auto">
			{name}
			{
				(name.endsWith("[Accelerated]")) ? 
					<OverlayTrigger placement="top" overlay={
						<Tooltip>If you completed the subject a year early. 
							Uses the scaling of the previous year (i.e. {Number(year) - 1})</Tooltip>
					}>
						<Image className='help-icon' src={helpButtonImg} alt="Subject Tooltip"/>
					</OverlayTrigger> : ""
			}
		</span>
	);
}


interface SubjectRawScoreProps {
	score: string,
	onScoreChange: (score: string) => void,
}
  
function SubjectRawScore({score, onScoreChange}: SubjectRawScoreProps) {
	function handleScoreChange(event: React.FormEvent<HTMLInputElement> & {target: HTMLInputElement}){
		if (!event.target) return;

		if (event.target.value) {
			// only allow integer values between 0 and 100
			let score = Math.round(Number(event.target.value));
			if (score > 100) {
				return;
			} else if (score < 0) {
				score = Math.abs(score);
			}
			onScoreChange(String(score));
		} else {
			onScoreChange("");  // allow blank values 
		}
	}

	return (
		<input 
			type="number" 
			min="0" 
			max="100"
			title="Subject Raw Score Input"
			value={score} 
			onChange={handleScoreChange}>
		</input>
	);
}


interface SubjectRowProps {
	code: string,
	year: number,
	score: string,
	onScoreChange: (code: string, score: string) => void
	onSubjectDelete: (code: string) => void,
}

function SubjectRow({code, year, score, onScoreChange, onSubjectDelete}: SubjectRowProps) {
	function handleScoreChange(score: string) {
		onScoreChange(code, score);
	}

	function handleSubjectDelete() {
		onSubjectDelete(code);
	}

	return (
		<li className="SubjectRow">
			<span className="DeleteSubject" onClick={handleSubjectDelete}></span>
			<SubjectName name={SUBJECTS[code]} year={year}/>
			<SubjectRawScore score={score} onScoreChange={handleScoreChange} />
		</li>
	);
}

interface SubjectSelectorProps {
	subjects: Subjects,
	year: number,
	onSubjectAdd: (selectedOption: {value: string}) => void,
}

function SubjectSelector({subjects, year, onSubjectAdd}: SubjectSelectorProps) {
	const filterOptions = (candidate: {value: string, label: string}, input: string) => {
		// remove an option if it has already been added
		if (Object.keys(subjects).includes(candidate.value) && subjects[candidate.value] !== undefined) {
			return false;
		}

		// normal filter stuff
		if (input) {
			if (candidate.label.toLowerCase().includes(input.toLowerCase()))
				return true;
		} else {
			// if no input, allow everything
			return true;
		}
	}

	const options = [];
	for (const subjectCode of Object.keys(getSubjects(year))) {
		options.push({value: subjectCode, label: SUBJECTS[subjectCode]});
	}

	const customStyles = {
		control: (provided: object/*, state: unknown*/) => ({
			...provided,
			// background: '#fff',
			minHeight: '2.3rem',
			height: '2.3rem',
			alignContent: 'center',
		}),
		valueContainer: (provided: object/*, state: unknown*/) => ({
			...provided,
			height: '2.3rem',
			display: 'flex',
			flexDirection: 'row-reverse',
			justifyContent: 'flex-end',
			alignContent: 'center',
			padding: '0rem 0.5rem'
		}),
		input: (provided: object/*, state: unknown*/) => ({
			...provided,
			width: '1px',
		}),
		placeholder: (provided: object/*, state: unknown*/) => ({
			...provided,
			fontSize: '1rem',
			marginLeft: '0px',
		}),
		/* indicatorSeparator: (provided, state) => ({
			...provided,
			display: 'none',
		}), */
		indicatorsContainer: (provided: object/*, state: unknown*/) => ({
			...provided,
			height: '2.2rem',
		}),
		option: (provided: object/*, state: unknown*/) => ({
			...provided,
			padding: '0.35rem 0.75rem',
		}),
	};

	return (
		<Select 
			className='subject-selector'
			classNamePrefix='subject-selector'
			options={options} 
			onChange={onSubjectAdd}
			filterOption={filterOptions}
			placeholder="Add a subject..."
			value={null}
			styles={customStyles}
		/>
	);
}


interface SaveButtonProps {
	saved: boolean,
	onClick: () => void,
	className: string,
}

function SaveButton({saved, onClick, className}: SaveButtonProps) {
	const imgSrc = (saved) ? saveButtonImgFilled : saveButtonImg;
	return (
		<img src={imgSrc} id="save_img" title="Save Subjects" alt="Save Subjects" onClick={onClick} 
			className={className}></img>
	);
}


interface SubjectsTableProps {
	subjects: Subjects,
	year: number,
	saved: boolean,
	className: string,
	onScoreChange: (code: string, score: string) => void,
	onSubjectAdd: (selectedOption: {value: string}) => void,
	onSubjectDelete: (code: string) => void,
	onSubjectsSave: () => void,
}

export default function SubjectsTable({
		subjects, year, saved, className, 
		onScoreChange, onSubjectAdd, onSubjectsSave, onSubjectDelete
		}: SubjectsTableProps) {
	// generate a row for each subject
	const rows = [];
	for (const subjectCode of Object.keys(subjects)) {
		if (subjects[subjectCode] !== undefined) {
			rows.push(
				<SubjectRow 
					key={subjectCode} 
					code={subjectCode} 
					score={subjects[subjectCode]} 
					onScoreChange={onScoreChange} 
					onSubjectDelete={onSubjectDelete}
					year={year}
				/>
			);
		}
	}

	return (
		<div className={className}>
			<SaveButton onClick={onSubjectsSave} saved={saved} className="float-end"/>
			<h4>Subjects</h4>
			<ul className="mb-1">
				{rows}
				<li key="0">
					<SubjectSelector 
						onSubjectAdd={onSubjectAdd} 
						subjects={subjects}
						year={year}
					/>
				</li>
			</ul>
		</div>
	);
}