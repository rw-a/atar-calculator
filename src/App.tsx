import './App.css';
import React, {Suspense, useEffect, useState} from 'react';

import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Image from 'react-bootstrap/Image';

import { SubjectCode, Subjects, Score, Tabs } from './types';
import { getSubjects } from './utility/data';
import SubjectsTable from './modules/subjects';
import ResultsTable from './modules/results';

import subjectScalingTabImg from './assets/subject_scaling_tab.svg';
import resultsTabImg from './assets/results_tab.svg';


const ScalingGraph = React.lazy(() => import('./modules/scaling'));

function YearSelector({onYearSelect}: {onYearSelect: (selectedYear: number) => void}) {
	return (
			<ToggleButtonGroup type="radio" name="year" defaultValue={2022} onChange={onYearSelect}>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" 
					id="year-2020" key={2020} value={2020}>2020</ToggleButton>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" 
					id="year-2021" key={2021} value={2021}>2021</ToggleButton>
				<ToggleButton variant="outline-primary" className="mb-auto button-small" 
					id="year-2022" key={2022} value={2022}>2022</ToggleButton>
			</ToggleButtonGroup>
		);
}


interface SectionProps {
	subjects: Subjects,
	year: number,
	defaultTab: Tabs,
	className: string,
}

function Section({subjects, year, defaultTab, className}: SectionProps) {
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
	
	function handleOnSelect(selectedTab: string | null) {
		if (selectedTab) {
			setTab(selectedTab as Tabs);
		}
	}

	return (
		<div className={`${className} section-inner`}>
			<Nav activeKey="1" onSelect={handleOnSelect}>
				<NavDropdown title={tabTitles[tab]} id="section-dropdown" as="h4">
					<NavDropdown.Item className={(tab === "scaling") ? "active" : ""} eventKey="scaling">
						<Image src={subjectScalingTabImg} alt="Subject Scaling Tab"/> Subject Scaling
					</NavDropdown.Item>
					<NavDropdown.Item className={(tab === "results") ? "active" : ""} eventKey="results">
						<Image src={resultsTabImg} alt="Results Tab"/> Results
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
			{tabs[tab]}
		</div>
	);
}


export default function Calculator() {
	const [year, setYear] = useState(2022);
	
	const storedSubjects = localStorage.getItem("subjects");
	const prevSubjects = (storedSubjects) ? JSON.parse(storedSubjects) : {} as Subjects;
	const [savedSubjects, setSavedSubjects] = useState(prevSubjects);
	const [subjects, setSubjects] = useState(prevSubjects);

	function handleScoreChange(score: Score, subjectCode: SubjectCode) {
		const newSubjects = {...subjects};
		newSubjects[subjectCode] = score;
		setSubjects(newSubjects);
	}

	function handleSubjectAdd(selectedOption: {value: string}) {
		const newSubjects = {...subjects};
		newSubjects[selectedOption.value] = "";
		setSubjects(newSubjects);
	}

	function handleSubjectDelete(subjectCode: SubjectCode) {
		// delete a subject by making its score undefined
		// IMPORTANT if anything iterates through the state, it must ignore undefined values
		const newSubjects = {...subjects};
		newSubjects[subjectCode] = undefined;
		setSubjects(newSubjects);
	}

	useEffect(() => {
		localStorage.setItem("subjects", JSON.stringify(savedSubjects));
	}, [savedSubjects]);

	function handleSubjectsSave() {
		setSavedSubjects(subjects);
	}

	function handleYearSelect(selectedYear: number) {
		setYear(selectedYear);
	}

	const saved = (JSON.stringify(savedSubjects) === JSON.stringify(subjects));

	const subjectsFiltered = {} as Subjects;
	const subjectsInYear = getSubjects(year);
	for (const subjectCode of Object.keys(subjects)) {
		if (subjects[subjectCode] === undefined) continue;
		if (Object.keys(subjectsInYear).includes(subjectCode)) {
			subjectsFiltered[subjectCode as SubjectCode] = subjects[subjectCode];
		}
	}

	return (
		<div id="content">
			<h2>ATAR Calculator QLD/QCE</h2>
			<div className="d-flex flex-column flex-md-row justify-content-between my-2">
				<p className='text-small fst-italic me-1 mb-2 mb-md-1'>
					ATAR Calculator and Subject Scaling Grapher for Queensland (QCE system). 
					Neither QTAC nor QCAA endorse or are affiliated with this website. 
					Scaling changes every year, so use at your own risk!
				</p>
				<YearSelector onYearSelect={handleYearSelect}></YearSelector>
			</div>	
			<SubjectsTable 
				subjects={subjectsFiltered} 
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
				subjects={subjectsFiltered}
				year={year}
				className="my-3"
			/>
		</div>
	);
}