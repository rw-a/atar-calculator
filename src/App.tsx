import './App.css';
import React, {ChangeEvent, Suspense, useEffect, useState} from 'react';

import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { getSubjects } from './modules/data';
import SubjectsTable, { Subjects } from './modules/subjects';
import ResultsTable from './modules/results';

const ScalingGraph = React.lazy(() => import('./modules/scaling'));

function YearSelector({onYearSelect}: {onYearSelect: ChangeEvent}) {
	return (
			<ToggleButtonGroup type="radio" name="year" defaultValue={2022} onChange={onYearSelect}>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2020" key={2020} value={2020}>2020</ToggleButton>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2021" key={2021} value={2021}>2021</ToggleButton>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" id="year-2022" key={2022} value={2022}>2022</ToggleButton>
			</ToggleButtonGroup>
		);
}

function Section({subjects, year, defaultTab, className}: SubjectComponent) {
	const tabTitles = {
		scaling: "Subject Scaling Graph",
		results: "Results"
	};

	const [tab, setTab] = useState(defaultTab);

	const tabs = {
		scaling: 
			<Suspense fallback={<div>Loading...</div>}>
				<ScalingGraph subjects={subjects} year={year}/>
			</Suspense>,
		results: <ResultsTable subjectRawScores={subjects} year={year}/>
	};	

	return (
		<div className={`${className} section-inner`}>
			<Nav activeKey="1" onSelect={setTab}>
				<NavDropdown title={tabTitles[tab]} id="section-dropdown" as="h4">
					<NavDropdown.Item className={(tab === "scaling") ? "active" : ""} eventKey="scaling">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-fill" viewBox="0 0 16 16">
							<path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
						</svg> Subject Scaling
					</NavDropdown.Item>
					<NavDropdown.Item className={(tab === "results") ? "active" : ""} eventKey="results">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calculator-fill" viewBox="0 0 16 16">
							<path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z"/>
						</svg> Results
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
			{tabs[tab]}
		</div>
	);
}


export default function Calculator() {
	const [year, setYear] = useState(2022);
	// subjects contains only the subjects with data in the selected year, whereas allSubjects has all the subjects, including ones with no data in the selected year 
	const [subjects, setSubjects] = useState({} as Subjects);
	const [allSubjects, setAllSubjects] = useState({} as Subjects);

	function handleScoreChange(subjectCode: string, score: string) {
		const newSubjects = {...subjects};
		newSubjects[subjectCode] = score;
		setSubjects(newSubjects);
	}

	function handleSubjectAdd(selectedOption: {value: string}) {
		const newSubjects = {...subjects};
		newSubjects[selectedOption.value] = "";
		setSubjects(newSubjects);
	}

	function handleSubjectDelete(subjectCode: string) {
		// delete a subject by making its score undefined
		// IMPORTANT if anything iterates through the state, it must ignore undefined values
		const newSubjects = {...subjects};
		newSubjects[subjectCode] = undefined;
		setSubjects(newSubjects);

		const newAllSubjects = {...allSubjects};
		newAllSubjects[subjectCode] = undefined;
		setAllSubjects(newAllSubjects);
	}

	function handleSubjectsSave() {
		localStorage.setItem("subjects", JSON.stringify(subjects));
		// this.forceUpdate();
		// REPLACE FORCE UPDATE WITH STATE WHICH TRACKS IF SAVED
	}

	function handleYearSelect(selectedYear: number) {
		// copy subjects to allSubjects
		const newSubjects = {...subjects};
		const newAllSubjects = {...allSubjects};
		for (const subjectCode of Object.keys(newSubjects)) {
			if (newSubjects[subjectCode] === undefined) continue;
			newAllSubjects[subjectCode] = newSubjects[subjectCode];
		}

		// clear subjects
		for (const subjectCode of Object.keys(newSubjects)) {
			newSubjects[subjectCode] = undefined;
		}

		// copy valid subjects from allSubjects to subjects
		const subjectsInYear = getSubjects(selectedYear);
		for (const subjectCode of Object.keys(newAllSubjects)) {
			if (newAllSubjects[subjectCode] === undefined) continue;
			if (Object.keys(subjectsInYear).includes(subjectCode)) {
				newSubjects[subjectCode] = newAllSubjects[subjectCode];
			}
		}

		setYear(selectedYear);
		setSubjects(newSubjects);
		setAllSubjects(newAllSubjects);
	}

	useEffect(() => {
		// Load previously saved state
		const stateJSON = localStorage.getItem("subjects");
		if (!stateJSON || stateJSON === JSON.stringify(subjects)) return;
		const state = JSON.parse(stateJSON);
		setSubjects(state);
	});

	// check if saved state matches current state
	const savedState = localStorage.getItem("subjects");
	const saved = (savedState === JSON.stringify(subjects));

	return (
		<div id="content">
			<h2>ATAR Calculator QLD/QCE</h2>
			<div className="d-flex flex-column flex-md-row justify-content-between my-2">
				<p className='text-small fst-italic me-1 mb-2 mb-md-1'>ATAR Calculator and Subject Scaling Grapher for Queensland (QCE system). Neither QTAC nor QCAA endorse or are affiliated with this website. Scaling changes every year, so use at your own risk!</p>
				<YearSelector onYearSelect={handleYearSelect} className="align-self-end align-self-md-start"></YearSelector>
			</div>	
			<SubjectsTable 
				subjects={subjects} 
				saved={saved}
				onScoreChange={handleScoreChange}
				onSubjectAdd={handleSubjectAdd}
				onSubjectDelete={handleSubjectDelete}
				onSubjectsSave={handleSubjectsSave}
				year={year}
				className="my-2"
			/>
			<Section 
				defaultTab={"results"}
				subjects={subjects}
				saved={saved}
				year={year}
				onScoreChange={handleScoreChange}
				onSubjectAdd={handleSubjectAdd}
				onSubjectDelete={handleSubjectDelete}
				onSubjectsSave={handleSubjectsSave}
				className="my-3"
			/>
		</div>
	);
}