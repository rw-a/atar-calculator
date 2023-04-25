import SUBJECTS_2020 from '../data/2020_subjects.json';
import SCALINGDATA_2020 from '../data/2020_scaling_data.json';
import ATARDATA_2020 from '../data/2020_atar_data.json'

import SUBJECTS_2021 from '../data/2021_subjects.json';
import SCALINGDATA_2021 from '../data/2021_scaling_data.json';
import ATARDATA_2021 from '../data/2021_atar_data.json'

import SUBJECTS_2022 from '../data/2022_subjects.json';
import SCALINGDATA_2022 from '../data/2022_scaling_data.json';
import ATARDATA_2022 from '../data/2022_atar_data.json';

import { AtarData } from '../types';


export function getSubjects(year: number) {
    switch (year) {
        case 2020:
            return SUBJECTS_2020;
        case 2021:
            return SUBJECTS_2021;
        case 2022:
            return SUBJECTS_2022
        default:
            console.error(`Invalid year at getSubjects(). Year=${year}`);
            return {} as never;
    }
}

export function getScalingData(year: number) {
    switch (year) {
        case 2020:
            return SCALINGDATA_2020;
        case 2021:
            return SCALINGDATA_2021;
        case 2022:
            return SCALINGDATA_2022;
        default:
            console.error(`Invalid year at getScalingData(). Year=${year}`);
            return {} as never;
    }
}

export function getAtarData(year: number): AtarData {
    switch (year) {
        case 2020:
            return ATARDATA_2020;
        case 2021:
            return ATARDATA_2021;
        case 2022:
            return ATARDATA_2022;
        default:
            console.error(`Invalid year at getAtarData(). Year=${year}`);
            return {} as never;
    }
}


/* Fallback models if there is no data near the given raw score. */
export function estimateAtarModel(tea: number, year: number) {
    switch (year) {
        case 2020:
            return -0.000154594 * (tea ** 2) + 0.279766 * tea - 0.0000199988;
        case 2021:
            return -0.0000971137 * (tea ** 2) + 0.251785 * tea - 0.000701489;
        case 2022:
            return -0.0000866052 * (tea ** 2) + 0.247 * tea + 0.00542687;
        default:
            console.error(`Invalid year at predictAtarModel(). Year=${year}`);
            return 0 as never;
    }
}