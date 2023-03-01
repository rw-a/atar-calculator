import './App.css';
import React, {Suspense} from 'react';

import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { getSubjects } from './modules/data';
import SubjectsTable from './modules/subjects';
import ResultsTable from './modules/results';

const ScalingGraph = React.lazy(() => import('./modules/scaling'));


function setCookie(cookieName, cookieValue, expiryDays) {
  const date = new Date();
  date.setTime(date.getTime() + (expiryDays*24*60*60*1000));
  let expires = "expires="+ date.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
	let name = cookieName + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let cookieArray = decodedCookie.split(';');
	for(let i = 0; i < cookieArray.length; i++) {
		let cookie = cookieArray[i];
		while (cookie.charAt(0) === ' ') {
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf(name) === 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}
	return "";
}

class YearSelector extends React.Component {
	constructor(props) {
		super(props);
		this.handleYearSelect = this.handleYearSelect.bind(this);
	}

	handleYearSelect(selectedYear) {
		this.props.onYearSelect(selectedYear);
	}

	render() {
	return (
			<ToggleButtonGroup type="radio" name="year" defaultValue={2022} onChange={this.handleYearSelect}>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2020" key={2020} value={2020}>2020</ToggleButton>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2021" key={2021} value={2021}>2021</ToggleButton>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2022" key={2022} value={2022}>2022</ToggleButton>
			</ToggleButtonGroup>
		);
	}
}

class Section extends React.Component {
	constructor(props) {
		super(props);
		this.state = {tab: this.props.defaultTab};
		this.handleTabChange = this.handleTabChange.bind(this);

		this.tab_titles = {
			scaling: "Subject Scaling Graph",
			results: "Results"
		};
	}

	handleTabChange(tabCode) {
		this.setState({tab: tabCode});
	}

	render() {
		let tabs = {
			scaling: 
				<Suspense fallback={<div>Loading...</div>}>
					<ScalingGraph subjects={this.props.subjects} year={this.props.year}/>
				</Suspense>,
			results: <ResultsTable subjectRawScores={this.props.subjects} year={this.props.year}/>
		};	

		return (
			<div className={`${this.props.className} section-inner`}>
				<Nav activeKey="1" onSelect={this.handleTabChange}>
					<NavDropdown title={this.tab_titles[this.state.tab]} id="section-dropdown" as="h4">
						<NavDropdown.Item className={(this.state.tab === "scaling") ? "active" : ""} eventKey="scaling">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-fill" viewBox="0 0 16 16">
								<path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
							</svg> Subject Scaling
						</NavDropdown.Item>
						<NavDropdown.Item className={(this.state.tab === "results") ? "active" : ""} eventKey="results">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calculator-fill" viewBox="0 0 16 16">
								<path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z"/>
							</svg> Results
						</NavDropdown.Item>
					</NavDropdown>
				</Nav>
				{tabs[this.state.tab]}
			</div>
		);
	}
}

class Calculator extends React.Component {
	constructor(props) {
		super(props);
		// subjects contains only the subjects with data in the selected year, whereas allSubjects has all the subjects, including ones with no data in the selected year 
		this.state = {subjects: {}, year: '2022', allSubjects: {}};

		this.handleScoreChange = this.handleScoreChange.bind(this);
		this.handleSubjectAdd = this.handleSubjectAdd.bind(this);
		this.handleSubjectDelete = this.handleSubjectDelete.bind(this);
		this.handleSubjectsSave = this.handleSubjectsSave.bind(this);
		this.handleYearSelect = this.handleYearSelect.bind(this);
	}

	handleScoreChange(subjectCode, score) {
		let subjects = this.state.subjects;
		subjects[subjectCode] = score;
		this.setState({subjects: subjects});
	}

	handleSubjectAdd(selectedOption) {
		let subjects = this.state.subjects;
		subjects[selectedOption['value']] = "";
		this.setState({subjects: subjects});
	}

	handleSubjectDelete(subjectCode) {
		// delete a subject by making its score undefined
		// IMPORTANT if anything iterates through the state, it must ignore undefined values
		let subjects = this.state.subjects;
		subjects[subjectCode] = undefined;
		let allSubjects = this.state.allSubjects;
		allSubjects[subjectCode] = undefined;
		this.setState({subjects: subjects, allSubjects: allSubjects});
	}

	handleSubjectsSave() {
		setCookie("subjects", JSON.stringify(this.state.subjects), 180);
		this.forceUpdate();
	}

	handleYearSelect(selectedYear) {
		// copy subjects to allSubjects
		let currentSubjects = this.state.subjects;
		let allSubjects = this.state.allSubjects;
		for (let subjectCode of Object.keys(currentSubjects)) {
			if (currentSubjects[subjectCode] === undefined) continue;
			allSubjects[subjectCode] = currentSubjects[subjectCode];
		}

		// clear subjects
		for (let subjectCode of Object.keys(currentSubjects)) {
			currentSubjects[subjectCode] = undefined;
		}

		// copy valid subjects from allSubjects to subjects
		const subjectsInYear = getSubjects(selectedYear);
		for (let subjectCode of Object.keys(allSubjects)) {
			if (allSubjects[subjectCode] === undefined) continue;
			if (Object.keys(subjectsInYear).includes(subjectCode)) {
				currentSubjects[subjectCode] = allSubjects[subjectCode];
			}
		}

		this.setState({year: selectedYear, subjects: currentSubjects, allSubjects: allSubjects});
	}

	componentDidMount() {
		// Load previously saved state
		let state = getCookie("subjects");
		if (state === "") return;
		state = JSON.parse(state);
		this.setState({subjects: state});
	}

	render() {
		// check if saved state matches current state
		let saved_state = getCookie("subjects");
		let saved = (saved_state === JSON.stringify(this.state.subjects));

		return (
			<div id="content">
				<h2>ATAR Calculator QLD/QCE</h2>
				<div className="d-flex flex-column flex-md-row justify-content-between my-2">
					<p className='text-small fst-italic me-1 mb-2 mb-md-1'>ATAR Calculator and Subject Scaling Grapher for Queensland (QCE system). Neither QTAC nor QCAA endorse or are affiliated with this website. Scaling changes every year, so use at your own risk!</p>
					<YearSelector onYearSelect={this.handleYearSelect} className="align-self-end align-self-md-start"></YearSelector>
				</div>	
				<SubjectsTable 
					subjects={this.state.subjects} 
					saved={saved}
					onScoreChange={this.handleScoreChange}
					onSubjectAdd={this.handleSubjectAdd}
					onSubjectDelete={this.handleSubjectDelete}
					onSubjectsSave={this.handleSubjectsSave}
					year={this.state.year}
					className="my-2"
				/>
				<Section 
					defaultTab={"results"}
					subjects={this.state.subjects}
					saved={saved}
					year={this.state.year}
					onScoreChange={this.handleScoreChange}
					onSubjectAdd={this.handleSubjectAdd}
					onSubjectDelete={this.handleSubjectDelete}
					onSubjectsSave={this.handleSubjectsSave}
					className="my-3"
				/>
			</div>
		);
	}
}

export default Calculator;
