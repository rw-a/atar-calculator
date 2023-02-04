import SUBJECTS from './../data/all_subjects.json';

import SUBJECTS_2020 from './../data/2020_subjects.json';
import SCALINGDATA_2020 from './../data/2020_scaling_data.json';
import ATARDATA_2020 from './../data/2020_atar_data.json'

import SUBJECTS_2021 from './../data/2021_subjects.json';
import SCALINGDATA_2021 from './../data/2021_scaling_data.json';
import ATARDATA_2021 from './../data/2021_atar_data.json'

import SUBJECTS_2022 from './../data/2022_subjects.json';
import SCALINGDATA_2022 from './../data/2022_scaling_data.json';
import ATARDATA_2022 from './../data/2022_atar_data.json'


export function getSubjects(year) {
    let yearStr = String(year);
    if (yearStr === "2020") {
        return SUBJECTS_2020;
    } else if (yearStr === "2021") {
        return SUBJECTS_2021;
    } else if (yearStr === "2022") {
        return SUBJECTS_2022;
    } else {
        console.error(`Invalid year at getSubjects(). Year=${year}`);
    }
}

export function getScalingData(year) {
    let yearStr = String(year);
    if (yearStr === "2020") {
        return SCALINGDATA_2020;
    } else if (yearStr === "2021") {
        return SCALINGDATA_2021;
    } else if (yearStr === "2022") {
        return SCALINGDATA_2022;
    } else {
        console.error(`Invalid year at getScalingData(). Year=${year}`);
    }
}

export function getAtarData(year) {
    let yearStr = String(year);
    if (yearStr === "2020") {
        return ATARDATA_2020;
    } else if (yearStr === "2021") {
        return ATARDATA_2021;
    } else if (yearStr === "2022") {
        return ATARDATA_2022;
    } else {
        console.error(`Invalid year at getAtarData(). Year=${year}`);
    }
}


/* Fallback models if there is no data near the given raw score. */
export function approximateScaledScore2020(rawScore) {
    return 7.6042 * rawScore - 270.25;
}

export function approximateScaledScore2021(rawScore) {
    return 6.7612 * rawScore - 186.27;
}

export function approximateScaledScore2022(rawScore) {
    return 5.8013 * rawScore - 91.954;
}