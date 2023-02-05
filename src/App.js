import './App.css';
import React, {Suspense} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Nav from 'react-bootstrap/Nav';

import { getSubjects } from './modules/data';
import SubjectsTable from './modules/subjects';
import ResultsTable, { calculateTeaFromSubjects } from './modules/results';

const ScalingGraph = React.lazy(() => import('./modules/scaling'));
const TeaGraph = React.lazy(() => import('./modules/tea'));


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
			<div className="d-flex flex-row flex-md-column">
				<ToggleButtonGroup type="radio" name="year" defaultValue={2022} onChange={this.handleYearSelect}>
					<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2020" value={2020}>2020</ToggleButton>
					<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2021" value={2021}>2021</ToggleButton>
					<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2022" value={2022}>2022</ToggleButton>
				</ToggleButtonGroup>
				<p className="text-tiny fst-italic text-danger text-center my-auto ms-1 ms-md-0" style={(this.props.year === 2020) ? {} : { opacity: '0%' }}>Warning: Limited Data</p>
			</div>
		);
	}
}

class Section extends React.Component {
	constructor(props) {
		super(props);
		this.state = {tab: this.props.defaultTab};
		this.handleTabChange = this.handleTabChange.bind(this);

		this.tab_titles = {
			subjects: "Subjects",
			scaling: "Scaling",
			tea: "TEA Map",
			results: "Results"
		};
	}

	handleTabChange(tabCode) {
		this.setState({tab: tabCode});
	}

	render() {
		let tabs = {
			subjects: 
				<SubjectsTable 
					subjects={this.props.subjects} 
					saved={this.props.saved}
					onScoreChange={this.props.onScoreChange}
					onSubjectAdd={this.props.onSubjectAdd}
					onSubjectDelete={this.props.onSubjectDelete}
					onSubjectsSave={this.props.onSubjectsSave}
					year={this.props.year}
				/>,
			scaling: 
				<Suspense fallback={<div>Loading...</div>}>
					<ScalingGraph subjects={this.props.subjects} year={this.props.year}/>
				</Suspense>,
			tea: 
				<Suspense fallback={<div>Loading...</div>}>
					<TeaGraph tea={calculateTeaFromSubjects(this.props.subjects, this.props.year)} year={this.props.year}/>
				</Suspense>,
			results: <ResultsTable subjectRawScores={this.props.subjects} year={this.props.year}/>
		};	

		return (
			<div className="section-inner">
				<Nav variant="tabs" className="justify-content-end" defaultActiveKey={this.props.defaultTab} onSelect={this.handleTabChange}>
					<h4 className="section-title">{this.tab_titles[this.state.tab]}</h4>
					<Nav.Item>
						<Nav.Link eventKey="subjects">Subjects</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="scaling">Scaling</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="tea">TEA</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="results">Results</Nav.Link>
					</Nav.Item>
				</Nav>
				<div className="pt-1">
					{tabs[this.state.tab]}
				</div>
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
		if (state !== "") {
			state = JSON.parse(state);
			let subjects = {};
			for (let subjectCode of Object.keys(state)) {
				subjects[subjectCode] = state[subjectCode];
			}
			this.setState({subjects: subjects});
		}
	}

	render() {
		// check if saved state matches current state
		let saved_state = getCookie("subjects");
		let saved = (saved_state === JSON.stringify(this.state.subjects));

		return (
			<Container className="my-3">
				<h2>QLD/QCE ATAR Calculator</h2>
				<div className="d-flex flex-column flex-md-row justify-content-between my-2">
					<p className='text-small fst-italic me-1 mb-2 mb-md-1'>Quite accurate ATAR calculator for Queensland (QCE system). Neither QTAC nor QCAA endorse or are affiliated with this website. Scaling changes every year, so use at your own risk!</p>
					<YearSelector onYearSelect={this.handleYearSelect} year={this.state.year} className="align-self-end align-self-md-start"></YearSelector>
				</div>
				<Row className="gy-3">
					<Col xs={12} xl={6}>
						<Section 
							defaultTab={"subjects"}
							subjects={this.state.subjects}
							saved={saved}
							year={this.state.year}
							onScoreChange={this.handleScoreChange}
							onSubjectAdd={this.handleSubjectAdd}
							onSubjectDelete={this.handleSubjectDelete}
							onSubjectsSave={this.handleSubjectsSave}
						/>
					</Col>
					<Col xs={12} xl={6}>
						<Section 
							defaultTab={"results"}
							subjects={this.state.subjects}
							saved={saved}
							year={this.state.year}
							onScoreChange={this.handleScoreChange}
							onSubjectAdd={this.handleSubjectAdd}
							onSubjectDelete={this.handleSubjectDelete}
							onSubjectsSave={this.handleSubjectsSave}
						/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Calculator;
