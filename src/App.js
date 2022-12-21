import './App.css';
import React from 'react';
import SubjectsTable from './modules/subjects';
import ResultsTable from './modules/results'
import ScalingGraph from './modules/scalingGraph';
import TeaGraph from './modules/teaGraph';


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


class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleSubjectAdd = this.handleSubjectAdd.bind(this);
    this.handleSubjectDelete = this.handleSubjectDelete.bind(this);
    this.handleSubjectsSave = this.handleSubjectsSave.bind(this);
  }

  handleScoreChange(subjectCode, score) {
    let selectedSubjects = {};
    selectedSubjects[subjectCode] = score;
    this.setState(selectedSubjects);
  }

  handleSubjectAdd(selectedOption) {
    let selectedSubjects = {};
    selectedSubjects[selectedOption['value']] = "";
    this.setState(selectedSubjects);
  }

  handleSubjectDelete(subjectCode) {
    // delete a subject by making its score undefined
    // IMPORTANT if anything iterates through the state, it must ignore undefined values
    let selectedSubjects = {};
    selectedSubjects[subjectCode] = undefined;
    this.setState(selectedSubjects);
  }

  handleSubjectsSave() {
    setCookie("subjects", JSON.stringify(this.state), 180);
    this.forceUpdate();
  }

  componentDidMount() {
    // Load previously saved state
    let state = getCookie("subjects");
    if (state !== "") {
      state = JSON.parse(state);
      let selectedSubjects = {};
      for (let subjectCode of Object.keys(state)) {
        selectedSubjects[subjectCode] = state[subjectCode];
      }
      this.setState(selectedSubjects);
    }
  }

  render() {
    // check if saved state matches current state
    let saved_state = getCookie("subjects");
    if (saved_state === JSON.stringify(this.state)) {
      var saved = true;
    } else {
      saved = false;
    }

    return (
      <div id="content">
        <h1>QLD/QCE ATAR Calculator</h1>
        <p className='note'>Quite accurate ATAR calculator for Queensland (QCE system). Neither QTAC nor QCAA endorse or are affiliated with this website. Based on 2021 data. Scaling changes every year, so use at your own risk!</p>
        <SubjectsTable 
          id="subjects-table"
          subjects={this.state} 
          saved={saved}
          onScoreChange={this.handleScoreChange}
          onSubjectAdd={this.handleSubjectAdd}
          onSubjectDelete={this.handleSubjectDelete}
          onSubjectsSave={this.handleSubjectsSave}
        />
        <ResultsTable 
          id="results-table"
          subjectRawScores={this.state} 
        />
        <ScalingGraph subjects={this.state}/>
        <TeaGraph />
        <br/>
      </div>
    );
  }
}

export default Calculator;
