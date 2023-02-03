import React from 'react';
import Select from 'react-select';
import SUBJECTS from './../data/2021_subjects.json';

class SubjectName extends React.Component {
    render() {
      return (
        <span className="SubjectName">{this.props.name}</span>
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
				<SubjectName name={SUBJECTS[this.props.code]} />
				<SubjectRawScore score={this.props.score} onScoreChange={this.handleScoreChange} />
			</li>
		);
	}
}

class SubjectSelector extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubjectAdd = this.handleSubjectAdd.bind(this);

		this.options = [];
		for (let subjectCode of Object.keys(SUBJECTS)) {
			this.options.push({value: subjectCode, label: SUBJECTS[subjectCode]});
		}

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
		return (
			<Select 
				className='SubjectSelector'
				options={this.options} 
				onChange={this.handleSubjectAdd}
				filterOption={this.filterOptions}
				placeholder="Add a subject..."
				value={null} 
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
			<img src={img_src} id="save_img" title="Save Subjects" alt="Save Subjects" onClick={this.handleClick}></img>
		);
	}
}

export default class SubjectsTable extends React.Component {
	constructor(props) {
		super(props);
		this.handleScoreChange = this.handleScoreChange.bind(this);
		this.handleSubjectAdd = this.handleSubjectAdd.bind(this);
		this.handleSubjectDelete = this.handleSubjectDelete.bind(this);
		this.handleSubjectsSave = this.handleSubjectsSave.bind(this);
	}

	handleScoreChange(subjectCode, score) {
		this.props.onScoreChange(subjectCode, score);
	}

	handleSubjectAdd(selectedOption) {
		this.props.onSubjectAdd(selectedOption);
	}

	handleSubjectDelete(subjectCode) {
		this.props.onSubjectDelete(subjectCode);
	}

	handleSubjectsSave() {
		this.props.onSubjectsSave();
	}

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
						onScoreChange={this.handleScoreChange} 
						onSubjectDelete={this.handleSubjectDelete} 
					/>
				);
			}
		}

		return (
			<div>
				<SaveButton onClick={this.handleSubjectsSave} saved={this.props.saved}/>
				<ul className='section'>
					{rows}
					<li key="0">
						<SubjectSelector 
							onSubjectAdd={this.handleSubjectAdd} 
							subjects={this.props.subjects}
						/>
					</li>
				</ul>
			</div>
		);
	}
}