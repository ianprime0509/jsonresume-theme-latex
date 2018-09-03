"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2018 Ian Johnson
 *
 * This file is part of jsonresume-theme-latex, a free software project
 * distributed under the terms of the MIT License. A copy of the license can be
 * found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
const moment_1 = __importDefault(require("moment"));
/**
 * The date format to use (moment.js; see
 * https://momentjs.com/docs/#/displaying/format/).
 */
const DATE_FORMAT = 'LL';
/**
 * Escapes any LaTeX special characters in the given string.
 *
 * @param str the string to escape
 * @returns the escaped string
 */
function escape(str) {
    if (!str) {
        return '';
    }
    // Uses the approach described in https://stackoverflow.com/a/15604206.
    // TODO: complete the implementation by filling in more escapes.
    const escapes = {
        '\n': ' \\\\ ',
        ' - ': ' --- ',
    };
    const escapeRegex = new RegExp(Object.keys(escapes).join('|'), 'g');
    return str.replace(escapeRegex, matched => escapes[matched]);
}
/**
 * Indents the given code by one level.
 *
 * @param code the code to indent
 * @returns the indented code
 */
function indent(code) {
    return code
        .split('\n')
        .map(str => (str === '' ? '' : '  ' + str))
        .join('\n');
}
/**
 * Encloses the given LaTeX code inside the given environment.
 *
 * @param env the environment to use
 * @param code the code to enclose
 * @param args any arguments to pass to the environment
 * @returns the code within the environment
 */
function useEnvironment(env, code, ...args) {
    return `\\begin{${env}}${args.map(arg => `{${arg}}`).join('')}
${indent(code)}
\\end{${env}}`;
}
/**
 * Formats the given (raw) phone number into a pretty LaTeX form.
 *
 * TODO: make this function a bit more robust and document what it does better.
 *
 * @param phone the raw phone number (no punctuation except country code, e.g. 5555555555 or +15555555555) to format
 * @returns the formatted phone number
 */
function formatPhone(phone) {
    let country = '';
    if (phone[0] === '+' || phone.length > 10) {
        // Country code included.
        country = phone.slice(0, -10);
        phone = phone.slice(-10);
    }
    const formatted = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}--${phone.slice(6, 10)}`;
    return country ? `${country} ${formatted}` : formatted;
}
/**
 * Renders the resume header.
 *
 * @param resume the resume data
 * @returns the rendered header
 */
function renderHeader(resume) {
    const { name, label, email, phone, website, location } = resume.basics;
    const contents = [`\\name{${escape(name)}}`];
    if (label) {
        contents.push(`\\personallabel{${escape(label)}}`);
    }
    if (location) {
        contents.push(`\\location{${escape(location.address)} \\\\ ${escape(location.city)}, ${escape(location.postalCode)}}`);
    }
    if (email) {
        contents.push(`\\email{${email}}`);
    }
    if (phone) {
        const rawPhone = phone.replace(/[^+0-9]/g, '');
        const formattedPhone = formatPhone(rawPhone);
        contents.push(`\\phone{${rawPhone}}{${formattedPhone}}`);
    }
    if (website) {
        contents.push(`\\website{${website}}`);
    }
    return useEnvironment('header', contents.join('\n'));
}
/**
 * Renders the resume summary.
 *
 * @param summary the summary to render
 * @returns the rendered summary
 */
function renderSummary(summary) {
    return summary
        ? `\\summary{${escape(summary)}}`
        : '% Summary section omitted.';
}
/**
 * Renders the work section.
 *
 * @param work the work section of the resume
 * @returns the formatted section
 */
function renderWork(work) {
    if (!work) {
        return '% Work section omitted.';
    }
    const formattedJobs = work.map(job => {
        const startDate = moment_1.default(job.startDate).format(DATE_FORMAT);
        const endDate = job.endDate
            ? moment_1.default(job.endDate).format(DATE_FORMAT)
            : 'Present';
        let company = job.url
            ? `\\href{${job.url}}{${escape(job.company)}}`
            : escape(job.company);
        if (job.description) {
            company += ` ${escape(job.description)}`;
        }
        // The arguments have to be passed to the environment in a certain order:
        // 1. Company
        // 2. Position
        // 3. Date range
        // 4. Location
        const args = [
            escape(company),
            escape(job.position),
            `${startDate}--${endDate}`,
            escape(job.location),
        ];
        // Output the summary and highlights.
        const jobInfo = [];
        if (job.summary) {
            jobInfo.push(`\\jobsummary{${escape(job.summary)}}`);
        }
        if (job.highlights) {
            jobInfo.push(useEnvironment('jobhighlights', job.highlights
                .map(highlight => `\\item ${escape(highlight)}`)
                .join('\n')));
        }
        return useEnvironment('job', jobInfo.join('\n'), ...args);
    });
    return useEnvironment('work', formattedJobs.join('\n'));
}
/**
 * Renders the volunteer section.
 *
 * @param work the volunteer section of the resume
 * @returns the formatted section
 */
function renderVolunteer(volunteer) {
    if (!volunteer) {
        return '% Volunteer section omitted.';
    }
    const formattedPositions = volunteer.map(position => {
        const startDate = moment_1.default(position.startDate).format(DATE_FORMAT);
        const endDate = position.endDate
            ? moment_1.default(position.endDate).format(DATE_FORMAT)
            : 'Present';
        let organization = position.url
            ? `\\href{${position.url}}{${escape(position.organization)}}`
            : escape(position.organization);
        if (position.description) {
            organization += ` ${escape(position.description)}`;
        }
        // The arguments have to be passed to the environment in a certain order:
        // 1. Organization
        // 2. Position
        // 3. Date range
        // 4. Location
        const args = [
            escape(organization),
            escape(position.position),
            `${startDate}--${endDate}`,
            escape(position.location),
        ];
        // Output the summary and highlights.
        const positionInfo = [];
        if (position.summary) {
            positionInfo.push(`\\positionsummary{${escape(position.summary)}}`);
        }
        if (position.highlights) {
            positionInfo.push(useEnvironment('positionhighlights', position.highlights
                .map(highlight => `\\item ${escape(highlight)}`)
                .join('\n')));
        }
        return useEnvironment('position', positionInfo.join('\n'), ...args);
    });
    return useEnvironment('volunteer', formattedPositions.join('\n'));
}
/**
 * Renders the education section.
 *
 * @param education the education section of the resume
 * @returns the formatted section
 */
function renderEducation(education) {
    if (!education) {
        return '% Education section omitted.';
    }
    const formattedSchools = education.map(school => {
        const startDate = moment_1.default(school.startDate).format(DATE_FORMAT);
        const endDate = school.endDate
            ? moment_1.default(school.endDate).format(DATE_FORMAT)
            : 'Present';
        const degree = `${school.studyType} (${school.area})`;
        const gpa = school.gpa ? `GPA: ${escape(school.gpa)}` : '';
        // The arguments have to be passed to the environment in a certain order:
        // 1. Institution
        // 2. Degree
        // 3. Date range
        // 4. GPA
        const args = [
            escape(school.institution),
            escape(degree),
            `${startDate}--${endDate}`,
            escape(gpa),
        ];
        const schoolInfo = school.courses
            ? useEnvironment('courses', school.courses
                .map(course => `\\item ${escape(course)}`)
                .join('\n'))
            : '';
        return useEnvironment('school', schoolInfo, ...args);
    });
    return useEnvironment('education', formattedSchools.join('\n'));
}
/**
 * Renders the awards section.
 *
 * @param awards the awards section of the resume
 * @returns the formatted section
 */
function renderAwards(awards) {
    if (!awards) {
        return '% Awards section omitted.';
    }
    const formattedAwards = awards.map(award => {
        const date = moment_1.default(award.date).format(DATE_FORMAT);
        // Arguments to the award environment:
        // 1. Award title
        // 2. Date
        // 3. Awarder
        const args = [escape(award.title), date, escape(award.awarder)];
        const awardInfo = award.summary
            ? `\\awardsummary{${escape(award.summary)}}`
            : '';
        return useEnvironment('award', awardInfo, ...args);
    });
    return useEnvironment('awards', formattedAwards.join('\n'));
}
/**
 * Renders the publications section.
 *
 * @param publications the publications section of the resume
 * @returns the formatted section
 */
function renderPublications(publications) {
    if (!publications) {
        return '% Publications section omitted.';
    }
    const formattedPublications = publications.map(publication => {
        const title = publication.url
            ? `\\href{${publication.url}}{${escape(publication.name)}}`
            : escape(publication.name);
        const date = moment_1.default(publication.releaseDate).format(DATE_FORMAT);
        // Arguments to the publication environment:
        // 1. Title
        // 2. Publisher
        // 3. Date
        const args = [title, escape(publication.publisher), date];
        const publicationInfo = publication.summary
            ? `\\publicationsummary{${escape(publication.summary)}}`
            : '';
        return useEnvironment('publication', publicationInfo, ...args);
    });
    return useEnvironment('publications', formattedPublications.join('\n'));
}
/**
 * Renders the skills section.
 *
 * @param skills the skills section of the resume
 * @returns the formatted section
 */
function renderSkills(skills) {
    if (!skills) {
        return '% Skills section omitted.';
    }
    const formattedSkills = skills.map(skill => {
        let content = skill.name;
        if (skill.level) {
            content += ` (${skill.level})`;
        }
        return `\\item ${escape(content)}`;
    });
    return useEnvironment('skills', formattedSkills.join('\n'));
}
/**
 * Renders the languages section.
 *
 * @param languages the languages section of the resume
 * @returns the formatted section
 */
function renderLanguages(languages) {
    if (!languages) {
        return '% Languages section omitted.';
    }
    const formattedLanguages = languages.map(language => {
        let content = language.language;
        if (language.fluency) {
            content += ` (${language.fluency})`;
        }
        return `\\item ${escape(content)}`;
    });
    return useEnvironment('languages', formattedLanguages.join('\n'));
}
/**
 * Renders the interests section.
 *
 * @param interests the interests section of the resume
 * @returns the formatted section
 */
function renderInterests(interests) {
    if (!interests) {
        return '% Interests section omitted.';
    }
    const formattedInterests = interests.map(interest => `\\item ${escape(interest.name)}`);
    return useEnvironment('interests', formattedInterests.join('\n'));
}
/**
 * Renders the references section.
 *
 * @param references the references section of the resume
 * @returns the formatted section
 */
function renderReferences(references) {
    if (!references) {
        return '% References section omitted.';
    }
    const formattedReferences = references.map(reference => `\\reference{${escape(reference.name)}} ${escape(reference.reference)}`);
    return useEnvironment('references', formattedReferences.join('\n'));
}
/**
 * Renders the projects section.
 *
 * @param projects the projects section of the resume
 * @returns the formatted section
 */
function renderProjects(projects) {
    if (!projects) {
        return '% Projects section omitted.';
    }
    const formattedProjects = projects.map(project => {
        const name = project.url
            ? `\\href{${project.url}}{${escape(project.name)}}`
            : escape(project.name);
        const roles = project.roles ? project.roles.join(', ') : '';
        const startDate = moment_1.default(project.startDate).format(DATE_FORMAT);
        const endDate = project.endDate
            ? moment_1.default(project.endDate).format(DATE_FORMAT)
            : 'Present';
        // Arguments to the project environment:
        // 1. Name
        // 2. Role
        // 3. Date range
        // 4. Company
        const args = [
            name,
            escape(roles),
            `${startDate}--${endDate}`,
            escape(project.entity),
        ];
        const projectInfo = [];
        if (project.description) {
            projectInfo.push(`\\projectsummary{${escape(project.description)}}`);
        }
        if (project.highlights) {
            projectInfo.push(useEnvironment('projecthighlights', project.highlights
                .map(highlight => `\\item ${escape(highlight)}`)
                .join('\n')));
        }
        return useEnvironment('project', projectInfo.join('\n'), ...args);
    });
    return useEnvironment('projects', formattedProjects.join('\n'));
}
/**
 * The default options to use for the renderer.
 */
const defaultOptions = {
    documentClass: 'article',
    preamble: '',
    renderHeader,
    renderSummary,
    sectionOptions: {
        awards: {
            render: renderAwards,
        },
        education: {
            render: renderEducation,
        },
        interests: {
            render: renderInterests,
        },
        languages: {
            render: renderLanguages,
        },
        projects: {
            render: renderProjects,
        },
        publications: {
            render: renderPublications,
        },
        references: {
            render: renderReferences,
        },
        skills: {
            render: renderSkills,
        },
        volunteer: {
            render: renderVolunteer,
        },
        work: {
            render: renderWork,
        },
    },
    sections: [
        'work',
        'volunteer',
        'education',
        'awards',
        'publications',
        'skills',
        'languages',
        'interests',
        'references',
        'projects',
    ],
};
/**
 * Returns a render function that renders resume data in LaTeX format.
 *
 * @param options the options to use for the renderer
 *
 * @returns the render function
 */
function makeTheme(options = defaultOptions) {
    // Provide values for unspecified options.
    const allOptions = Object.assign(defaultOptions, options);
    return resume => {
        return `\\documentclass{${allOptions.documentClass}}
${allOptions.preamble}
\\begin{document}
${allOptions.renderHeader(resume)}
${allOptions.renderSummary(resume.basics.summary)}
${allOptions.sections
            .map(section => allOptions.sectionOptions[section].render(resume[section]))
            .join('\n')}
\\end{document}
`;
    };
}
exports.makeTheme = makeTheme;
