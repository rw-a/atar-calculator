import './../css/subjects.css';
import React from 'react';
import Select from 'react-select';

import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { getSubjects } from './data';
import SUBJECTS from './../data/all_subjects.json';

class SubjectName extends React.Component {
    render() {
		return (
			<span className="me-auto">
				{this.props.name}
				{
					(this.props.name.endsWith("[Accelerated]")) ? 
						<OverlayTrigger placement="top" overlay={<Tooltip>If you completed the subject a year early. Uses the scaling of the previous year (i.e. {this.props.year - 1})</Tooltip>}>
							<Image className='help-icon' src={require('./../assets/help.svg').default}/>
						</OverlayTrigger> : ""
				}
			</span>
		);
    }
  }
  
class SubjectRawScore extends React.Component {
	constructor(props) {
		super(props);
		this.handleScoreChange = this.handleScoreChange.bind(this);
	}

	handleScoreChange(e) {
		// only allow integer values between 0 and 100
		let score = Math.round(e.target.value);
		if (score > 100) {
			return;
		} else if (score < 0) {
			score = Math.abs(score);
		}
		if (e.target.value.length < 1) {
			score = "";  // allow blank values 
		}
		this.props.onScoreChange(String(score));
	}

	render() {
		return (
			<input 
				className="SubjectRawScore" 
				type="number" 
				min="0" 
				max="100"
				value={this.props.score} 
				onChange={this.handleScoreChange}>
			</input>
		);
	}
}

class DeleteSubject extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.onClick();
	}
	
	render() {
		return (
			<span className="DeleteSubject" onClick={this.handleClick}></span>
		);
	}
}

class SubjectRow extends React.Component {
	constructor(props) {
		super(props);
		this.handleScoreChange = this.handleScoreChange.bind(this);
		this.handleSubjectDelete = this.handleSubjectDelete.bind(this);
	}

	handleScoreChange(score) {
		this.props.onScoreChange(this.props.code, score);
	}

	handleSubjectDelete() {
		this.props.onSubjectDelete(this.props.code);
	}

	render() {
		return (
			<li className="SubjectRow">
				<DeleteSubject onClick={this.handleSubjectDelete} />
				<SubjectName name={SUBJECTS[this.props.code]} year={this.props.year}/>
				<SubjectRawScore score={this.props.score} onScoreChange={this.handleScoreChange} />
			</li>
		);
	}
}

class SubjectSelector extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubjectAdd = this.handleSubjectAdd.bind(this);

		this.filterOptions = (candidate, input) => {
			// remove an option if it has already been added
			if (Object.keys(this.props.subjects).includes(candidate.value) && this.props.subjects[candidate.value] !== undefined) {
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
	}

	handleSubjectAdd(selectedOption) {
		this.props.onSubjectAdd(selectedOption);
	}

	render() {
		let options = [];
		for (let subjectCode of Object.keys(getSubjects(this.props.year))) {
			options.push({value: subjectCode, label: SUBJECTS[subjectCode]});
		}

		const customStyles = {
			control: (provided, state) => ({
				...provided,
				// background: '#fff',
				minHeight: '2.3rem',
				height: '2.3rem',
				alignContent: 'center',
			}),
			valueContainer: (provided, state) => ({
			  	...provided,
			  	height: '2.3rem',
				display: 'flex',
				flexDirection: 'row-reverse',
				justifyContent: 'flex-end',
				alignContent: 'center',
			  	padding: '0rem 0.5rem'
			}),
			input: (provided, state) => ({
			  	...provided,
				width: '1px',
			}),
			placeholder: (provided, state) => ({
				...provided,
				fontSize: '1rem',
				marginLeft: '0px',
			}),
			/* indicatorSeparator: (provided, state) => ({
				...provided,
			  	display: 'none',
			}), */
			indicatorsContainer: (provided, state) => ({
			  	...provided,
			  	height: '2.2rem',
			}),
			option: (provided, state) => ({
				...provided,
				padding: '0.35rem 0.75rem',
		  	}),
		  };

		return (
			<Select 
				className='subject-selector'
				classNamePrefix='subject-selector'
				options={options} 
				onChange={this.handleSubjectAdd}
				filterOption={this.filterOptions}
				placeholder="Add a subject..."
				value={null}
				styles={customStyles}
			/>
		);
	}
}

class SaveButton extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.onClick();
	}

	render() {
		if (this.props.saved) {
			var img_src = require("./../assets/save_filled.svg").default;
		} else {
			img_src = require("./../assets/save.svg").default;
		}
		return (
			<img src={img_src} id="save_img" title="Save Subjects" alt="Save Subjects" onClick={this.handleClick} className={this.props.className}></img>
		);
	}
}

export default class SubjectsTable extends React.Component {
	render() {
		// generate a row for each subject
		let rows = [];
		for (let subjectCode of Object.keys(this.props.subjects)) {
			if (this.props.subjects[subjectCode] !== undefined) {
				rows.push(
					<SubjectRow 
						key={subjectCode} 
						code={subjectCode} 
						score={this.props.subjects[subjectCode]} 
						onScoreChange={this.props.onScoreChange} 
						onSubjectDelete={this.props.onSubjectDelete}
						year={this.props.year}
					/>
				);
			}
		}

		return (
			<div>
				<SaveButton onClick={this.props.onSubjectsSave} saved={this.props.saved} className="float-end"/>
				<h4>Subjects</h4>
				<ul className="mb-1">
					{rows}
					<li key="0">
						<SubjectSelector 
							onSubjectAdd={this.props.onSubjectAdd} 
							subjects={this.props.subjects}
							year={this.props.year}
						/>
					</li>
				</ul>
			</div>
		);
	}
}