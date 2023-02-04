import './App.css';
import React, {Suspense} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Nav from 'react-bootstrap/Nav';

import SubjectsTable from './modules/subjects';
import ResultsTable, { calculateTeaFromSubjects } from './modules/results';

const ScalingGraph = React.lazy(() => import('./modules/scaling'));
const TeaGraph = React.lazy(() => import('./modules/tea'));


function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
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
				<p className="text-small fst-italic text-danger text-center" style={(this.props.year === 2020) ? {} : { display: 'none' }}>Warning: Limited Data</p>
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
				/>,
			scaling: 
				<Suspense fallback={<div>Loading...</div>}>
					<ScalingGraph subjects={this.props.subjects}/>
				</Suspense>,
			tea: 
				<Suspense fallback={<div>Loading...</div>}>
					<TeaGraph tea={calculateTeaFromSubjects(this.props.subjects)} year={this.props.year}/>
				</Suspense>,
			results: <ResultsTable subjectRawScores={this.props.subjects}/>
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
		this.state = {subjects: {}, year: '2022'};
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
		this.setState({subjects: subjects});
	}

	handleSubjectsSave() {
		setCookie("subjects", JSON.stringify(this.state.subjects), 180);
		this.forceUpdate();
	}

	handleYearSelect(selectedYear) {
		this.setState({year: selectedYear});
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
		if (saved_state === JSON.stringify(this.state.subjects)) {
			var saved = true;
		} else {
			saved = false;
	}

    return (
      <Container className="my-3">
        <h2>QLD/QCE ATAR Calculator</h2>
        <div className="d-flex flex-column flex-md-row justify-content-between my-2">
          	<p className='text-small fst-italic me-1 mb-2 mb-md-1'>Quite accurate ATAR calculator for Queensland (QCE system). Neither QTAC nor QCAA endorse or are affiliated with this website. Scaling changes every year, so use at your own risk!</p>
			<YearSelector onYearSelect={this.handleYearSelect} year={this.state.year} className="align-self-end align-self-md-start"></YearSelector>
        </div>
		<Row className="gy-3">
			<Col lg={6}>
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
			<Col lg={6}>
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
