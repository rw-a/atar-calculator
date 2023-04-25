import { Score, Subjects, SubjectCode } from '../types';
import { getAtarData, getScalingData, estimateAtarModel } from '../utility/data';

export function calculateTeaFromScaledScores(scaledScoresAll: Score[]): number {
    const scaledScores = scaledScoresAll.filter((scaledScore) => scaledScore !== "") as number[];

    // calculate the TEA by taking the top 5 scaled scores
    let tea = 0;
    const numSubjects = scaledScores.length;
    for (let i = 0; i < Math.min(5, numSubjects); i++) {
        const maxScaledScore = Math.max(...scaledScores);
        tea += maxScaledScore;

        // remove the max score from the list
        const index = scaledScores.indexOf(maxScaledScore);
        if (index > -1) { // only splice array when item is found
            scaledScores.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    return tea;
}

export function calculateAtarFromTea(tea: number, year: number): string {
    // calculate ATAR using TEA
    const atarData = getAtarData(year);
    const teaList = Object.keys(atarData);     // assumes that ATARDATA is already sorted in ascending TEA order
    for (let i = 0; i < teaList.length; i++) {
        const currentTEA = teaList[i];
        if (tea < Number(currentTEA)) {
            const maxATAR = atarData[currentTEA];

            if (i === 0) {
                // if TEA is below the lowest available datapoint
                const estimatedAtar = Math.round(estimateAtarModel(tea, year) * 20) / 20
                if (estimatedAtar < maxATAR) {
                    return `~${estimatedAtar.toFixed(2)}`;
                } else {
                    return `<${maxATAR.toFixed(2)}`;
                }
            } else {
                const previousTEA = teaList[i - 1];
                const minATAR = atarData[previousTEA];
                if (minATAR === maxATAR || minATAR === 99.95) {
                    return minATAR.toFixed(2);
                } else {
                    // if the conservative method is not precise enough, 
                    // try using the estimated atar to give a more precise answer
                    if (maxATAR - minATAR > 0.5) {
                        const estimatedAtar = Math.round(estimateAtarModel(tea, year) * 20) / 20;
                        if (estimatedAtar >= minATAR && estimatedAtar <= maxATAR) {
                            return `~${estimatedAtar.toFixed(2)}`;
                        }
                    }
                    return `${minATAR.toFixed(2)}-${maxATAR.toFixed(2)}`;
                }
            }
        }
    }
    return "99.95";
}

export function calculateScaledScore(rawScore: number, subjectCode: SubjectCode, year: number) {
    const scalingData = getScalingData(year);
    const a = scalingData[subjectCode]["a"];
    const b = scalingData[subjectCode]["b"];
    return 100 / (1 + Math.exp(-a * (rawScore - b)));
    }

export function mapRawToScaledScores(subjects: Subjects, year: number): Subjects {
    // creates an object with keys being subjectCode and value being scaledScore
    const subjectScaledScores = {} as Subjects;
    for (const subjectCode of Object.keys(subjects) as SubjectCode[]) {
        const rawScore = subjects[subjectCode];
        if (rawScore || rawScore === 0) { // only scale if there is an actual input. otherwise be blank
            subjectScaledScores[subjectCode] = calculateScaledScore(rawScore, subjectCode, year);
        } else {
            subjectScaledScores[subjectCode] = "";
        }
    }
    return subjectScaledScores;
    }

export function calculateTeaFromSubjects(subjectRawScores: Subjects, year: number) {
    const subjectScaledScores = mapRawToScaledScores(subjectRawScores, year);
    const scaledScores = Object.values(subjectScaledScores);
    const tea = calculateTeaFromScaledScores(scaledScores);
    return tea;
}