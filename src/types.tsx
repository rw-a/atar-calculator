import SUBJECTS from './data/all_subjects.json';


/* App */
export type Tabs = "scaling" | "results";
export type Score = number | "";

export type SubjectCode = keyof typeof SUBJECTS;
export type Subjects = {
	[key in SubjectCode]: string | undefined
};


/* Subjects */
export type OnScoreChange = ((score: Score, code: SubjectCode) => void);
export type OnSubjectDelete = (code: SubjectCode) => void;
export type OnSubjectAdd = (selectedOption: {value: string}) => void;
export type OnSubjectsSave = () => void;
export type OnClick = () => void;


/* Results */
export type SubjectScores = {
    [key in SubjectCode]?: Score;
};

export type ScalingData = {
    [key in SubjectCode]?: {
        "a": string;
        "b": string;
    };
};

export interface AtarData {
    [key: string]: number
}