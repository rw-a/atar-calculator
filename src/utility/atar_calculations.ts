import { Score, Subjects, SubjectCode, SubjectScores } from '../types';
import { getAtarData, getScalingData, estimateAtarModel } from '../utility/data';

export function calculateTeaFromScaledScores(scaledScoresAll: Score[]): number {
    const scaledScores = scaledScoresAll.filter((scaledScore) => scaledScore !== "") as number[];

    // calculate the TEA by taking the top 5 scaled scores
    let tea: Score = 0;
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
        const currentTEA = Number(teaList[i]);
        if (tea < currentTEA) {
            const maxATAR = atarData[currentTEA].toFixed(2);
            // console.log((Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2));

            if (i === 0) {
                // if TEA is below the lowest available datapoint
                const estimatedAtar = (Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2);
                if (estimatedAtar < maxATAR) {
                    return `~${estimatedAtar}`;
                } else {
                    return `<${maxATAR}`;
                }
            } else {
                const previousTEA = teaList[i - 1];
                const minATAR = atarData[previousTEA].toFixed(2);
                if (minATAR === maxATAR || minATAR === "99.95") {
                    return minATAR;
                } else {
                    // if the conservative method is not precise enough, 
                    // try using the estimated atar to give a more precise answer
                    if (Number(maxATAR) - Number(minATAR) > 0.5) {
                        const estimatedAtar = (Math.round(estimateAtarModel(tea, year) * 20) / 20).toFixed(2);
                        if (estimatedAtar >= minATAR && estimatedAtar <= maxATAR) {
                            return `~${estimatedAtar}`;
                        }
                    }
                    return `${minATAR}-${maxATAR}`;
                }
            }
        }
    }
    return "99.95";
}

export function calculateScaledScore(rawScore: number, subjectCode: SubjectCode, year: number) {
    const scalingData = getScalingData(year);
    const a = Number(scalingData[subjectCode]["a"]);
    const b = Number(scalingData[subjectCode]["b"]);
    return 100 / (1 + Math.exp(-a * (rawScore - b)));
    }

export function mapRawToScaledScores(subjects: Subjects, year: number): SubjectScores {
    // creates an object with keys being subjectCode and value being scaledScore
    const subjectScaledScores = {} as SubjectScores;
    const subjectCodes = Object.keys(subjects).filter(
        (subjectCode) => {return (subjects[subjectCode as SubjectCode] !== undefined)}
    ) as SubjectCode[];
    for (const subjectCode of subjectCodes) {
        const rawScore = subjects[subjectCode];
        if (rawScore || rawScore === 0) { // only scale if there is an actual input. otherwise be blank
            subjectScaledScores[subjectCode] = calculateScaledScore(rawScore, subjectCode, year);
        } else {
            subjectScaledScores[subjectCode] = "";
        }
    }
    return subjectScaledScores;
    }

export function calculateTeaFromSubjects(subjectRawScores: SubjectScores, year: number) {
    const subjectScaledScores = mapRawToScaledScores(subjectRawScores, year);
    const scaledScores = Object.values(subjectScaledScores);
    const tea = calculateTeaFromScaledScores(scaledScores);
    return tea;
}