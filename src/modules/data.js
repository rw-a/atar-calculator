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
export function predictAtarModel2020(tea) {
    return -0.000154594 * (tea ** 2) + 0.279766 * tea - 0.0000199988;
}

export function preditAtarModel2021(tea) {
    return -0.000124505 * (tea ** 2) + 0.265103 * tea - 0.000190829;
}

export function predictAtarModel2022(tea) {
    return -0.0000862361 * (tea ** 2) + 0.246812 * tea + 0.00832645;
}