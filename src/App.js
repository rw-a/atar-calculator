import './App.css';
import React from 'react';
import Select from 'react-select';
import SUBJECTS from './data/2021_subjects.json';
import SCALINGDATA from './data/2021_scaling_data.json';
import ATARDATA from './data/2021_atar_data.json'


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
      var img_src = require("./assets/save_filled.svg").default;
    } else {
      img_src = require("./assets/save.svg").default;
    }
    return (
      <img src={img_src} id="save_img" title="Save Subjects" alt="Save Subjects" onClick={this.handleClick}></img>
    );
  }
}

class SubjectsTable extends React.Component {
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
          <h2>Subjects</h2>
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

class ResultsRow extends React.Component {
  render() {
    return(
      <tr>
        <td id='subjects-row'>{SUBJECTS[this.props.code]}</td>
        <td className='score'>{this.props.rawScore}</td>
        <td className='score'>{this.props.scaledScore}</td>
      </tr>
    );
  }
}

function calculateTeaFromScaledScores(scaledScores) {
   // calculate the TEA by taking the top 5 scaled scores
   let tea = 0;
   let numSubjects = scaledScores.length;
   for (let i = 0; i < Math.min(5, numSubjects); i++) {
     let maxScaledScore = Math.max(...scaledScores);
     tea += maxScaledScore;

     // remove the max score from the list
     const index = scaledScores.indexOf(maxScaledScore);
     if (index > -1) { // only splice array when item is found
       scaledScores.splice(index, 1); // 2nd parameter means remove one item only
     }
   }
   return tea;
}

function calculateAtarFromTea(tea) {
  // calculate ATAR using TEA
  let teaList = Object.keys(ATARDATA);     // assumes that ATARDATA is already sorted in ascending TEA order
  for (let i = 0; i < teaList.length; i++) {
    let currentTEA = Number(teaList[i]);
    if (tea < currentTEA) {
      let maxATAR = ATARDATA[currentTEA].toFixed(2);

      if (i === 0) {
        // if TEA is below the lowest available datapoint
        return `<${maxATAR}`;
      } else {
        let previousTEA = Number(teaList[i - 1]);
        let minATAR = ATARDATA[previousTEA].toFixed(2);
        if (minATAR === maxATAR || minATAR === "99.95") {
          return minATAR;
        } else {
          return `${minATAR}-${maxATAR}`;
        }
      }
    }
  }
  return "99.95";
}

class ResultsTable extends React.Component {
  render() {
    let subjectRawScores = this.props.subjectRawScores;
    let subjectCodes = Object.keys(subjectRawScores).filter((subjectCode) => {return (subjectRawScores[subjectCode] !== undefined)});

    // calculate the scaled scores
    let subjectScaledScores = {};
    for (let subjectCode of subjectCodes) {
      let rawScore = subjectRawScores[subjectCode];
      if (rawScore.length > 0) { // only scale if there is an actual input. otherwise be blank
        // calculate the scaled score
        rawScore = Number(rawScore);
        let a = Number(SCALINGDATA[subjectCode]["a"]);
        let b = Number(SCALINGDATA[subjectCode]["b"]);
        let c = Number(SCALINGDATA[subjectCode]["c"]);
        subjectScaledScores[subjectCode] = a / (1 + Math.exp(-b * (rawScore - c)));
      } else {
        subjectScaledScores[subjectCode] = "";
      }
    }

    // sort the subjects
    subjectCodes.sort((a, b) => {
      // by scaled score
      return (subjectScaledScores[b] - subjectScaledScores[a]);
    });

    // generate the rows of the table
    let rows = [];
    for (let subjectCode of subjectCodes) {
      let rawScore = subjectRawScores[subjectCode];
      let scaledScore = subjectScaledScores[subjectCode];
      scaledScore = (scaledScore ? Number(scaledScore).toFixed(2) : "");  // round the scaled score to 2 d.p.
      rows.push(
        <ResultsRow key={subjectCode} code={subjectCode} rawScore={rawScore} scaledScore={scaledScore} />
      );
    }
    // if no subjects added, add blank boxes as placeholders
    if (rows.length < 1) {
      rows.push(
        <ResultsRow key="0" code={""} rawScore={""} scaledScore={""} />
      );
    }

    // do the math
    let scaledScores = Object.values(subjectScaledScores);    // only the values, don't care about which subject
    let tea = calculateTeaFromScaledScores(scaledScores);
    let calculatedATAR = calculateAtarFromTea(tea);
    
    return (
      <div className='section'>
        <h2>Results</h2>
        <div id="results">
          <div className='results'>
            <p className='heading'>Estimated TEA</p>
            <p className='resultNumber'>{tea.toFixed(2)}</p>
            <p className='note'>Your top 5 scaled scores</p>
          </div>
          <div className='results'>
            <p className='heading'>Estimated ATAR</p>
            <p className='resultNumber'>{calculatedATAR}</p>
            <p className='note'>No data for ATARs below 97.60</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Raw Score</th>
              <th>Scaled Score</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
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
        <p className='note'>A quite accurate ATAR calculator for Queensland (QCE system). Neither QTAC nor QCAA endorse or are affiliated with this website. Based on 2021 data. Scaling changes every year, so use at your own risk!</p>
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
      </div>
    );
  }
}

export default Calculator;
