/*
 * Copyright 2018 Ian Johnson
 *
 * This file is part of jsonresume-theme-latex, a free software project
 * distributed under the terms of the MIT License.  A copy of the license can be
 * found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
const fs = require('fs');
const moment = require('moment');
const path = require('path');

/**
 * The date format to use (moment.js; see
 * https://momentjs.com/docs/#/displaying/format/).
 */
const DATE_FORMAT = 'LL';

/**
 * Escape any LaTeX special characters in the given string.
 *
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
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
 * Indent the given code by one level.
 *
 * @param {string} code The code to indent.
 * @returns {string} The indented code.
 */
function indent(code) {
  return code
    .split('\n')
    .map(str => (str === '' ? '' : '  ' + str))
    .join('\n');
}

/**
 * Enclose the given LaTeX code inside the given environment.
 *
 * @param {string} env The environment to use.
 * @param {string} code The code to enclose.
 * @param {...string} args Any arguments to pass to the environment.
 * @returns {string} The code within the environment.
 */
function useEnvironment(env, code, ...args) {
  return `\\begin{${env}}${args.map(arg => `{${arg}}`).join('')}
${indent(code)}
\\end{${env}}`;
}

/**
 * Format the given (raw) phone number into a pretty LaTeX form.
 *
 * TODO: make this function a bit more robust and document what it does better.
 *
 * @param {string} phone The raw phone number (no punctuation except country code, e.g. 5555555555 or +15555555555) to format.
 * @returns {string} The formatted phone number.
 */
function formatPhone(phone) {
  let country = '';
  if (phone[0] === '+' || phone.length > 10) {
    // Country code included.
    country = phone.slice(0, -10);
    phone = phone.slice(-10);
  }
  const formatted = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}--${phone.slice(
    6,
    10
  )}`;

  return country ? `${country} ${formatted}` : formatted;
}

/**
 * Render the resume header.
 *
 * @param {Resume} resume The resume data.
 * @returns {string} The rendered header.
 */
function renderHeader(resume) {
  const basics = resume.basics;
  const { name, label, email, phone, website, location } = resume.basics;

  let contents = [`\\name{${escape(name)}}`];
  if (label) {
    contents.push(`\\personallabel{${escape(label)}}`);
  }
  if (location) {
    contents.push(
      `\\location{${escape(location.address)} \\\\ ${escape(
        location.city
      )}, ${escape(location.postalCode)}}`
    );
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
 * Render the resume summary.
 *
 * @param {string} summary The summary to render.
 * @returns {string} The rendered summary.
 */
function renderSummary(summary) {
  return summary
    ? `\\summary{${escape(summary)}}`
    : '% Summary section omitted.';
}

/**
 * Render the work section.
 *
 * @param {Array.<Job>} work The work section of the resume.
 * @returns {string} The formatted section.
 */
function renderWork(work) {
  if (!work) {
    return '% Work section omitted.';
  }

  const formattedJobs = work.map(job => {
    const startDate = moment(job.startDate).format(DATE_FORMAT);
    const endDate = job.endDate
      ? moment(job.endDate).format(DATE_FORMAT)
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
    let jobInfo = [];
    if (job.summary) {
      jobInfo.push(`\\jobsummary{${escape(job.summary)}}`);
    }
    if (job.highlights) {
      jobInfo.push(
        useEnvironment(
          'jobhighlights',
          job.highlights
            .map(highlight => `\\item ${escape(highlight)}`)
            .join('\n')
        )
      );
    }

    return useEnvironment('job', jobInfo.join('\n'), ...args);
  });

  return useEnvironment('work', formattedJobs.join('\n'));
}

/**
 * Render the volunteer section.
 *
 * @param {Array.<Position>} work The volunteer section of the resume.
 * @returns {string} The formatted section.
 */
function renderVolunteer(volunteer) {
  if (!volunteer) {
    return '% Volunteer section omitted.';
  }

  const formattedPositions = volunteer.map(position => {
    const startDate = moment(position.startDate).format(DATE_FORMAT);
    const endDate = position.endDate
      ? moment(position.endDate).format(DATE_FORMAT)
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
    let positionInfo = [];
    if (position.summary) {
      positionInfo.push(`\\positionsummary{${escape(position.summary)}}`);
    }
    if (position.highlights) {
      positionInfo.push(
        useEnvironment(
          'positionhighlights',
          position.highlights
            .map(highlight => `\\item ${escape(highlight)}`)
            .join('\n')
        )
      );
    }

    return useEnvironment('position', positionInfo.join('\n'), ...args);
  });

  return useEnvironment('volunteer', formattedPositions.join('\n'));
}

/**
 * Render the education section.
 *
 * @param {Array.<School>} education The education section of the resume.
 * @returns {string} The formatted section.
 */
function renderEducation(education) {
  if (!education) {
    return '% Education section omitted.';
  }

  const formattedSchools = education.map(school => {
    const startDate = moment(school.startDate).format(DATE_FORMAT);
    const endDate = school.endDate
      ? moment(school.endDate).format(DATE_FORMAT)
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
      ? useEnvironment(
          'courses',
          school.courses.map(course => `\\item ${escape(course)}`).join('\n')
        )
      : '';

    return useEnvironment('school', schoolInfo, ...args);
  });

  return useEnvironment('education', formattedSchools.join('\n'));
}

/**
 * Render the awards section.
 *
 * @param {Array.<Award>} awards The awards section of the resume.
 * @returns {string} The formatted section.
 */
function renderAwards(awards) {
  if (!awards) {
    return '% Awards section omitted.';
  }

  const formattedAwards = awards.map(award => {
    const date = moment(award.date).format(DATE_FORMAT);
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
 * Render the publications section.
 *
 * @param {Array.<Publication>} publications The publications section of the resume.
 * @returns {string} The formatted section.
 */
function renderPublications(publications) {
  if (!publications) {
    return '% Publications section omitted.';
  }

  let formattedPublications = publications.map(publication => {
    const title = publication.url
      ? `\\href{${publication.url}}{${escape(publication.name)}}`
      : escape(publication.name);
    const date = moment(publication.releaseDate).format(DATE_FORMAT);
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
 * Render the skills section.
 *
 * @param {Array.<Skill>} skills The skills section of the resume.
 * @returns {string} The formatted section.
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
    return `\\skill ${escape(content)}`;
  });

  return useEnvironment('skills', formattedSkills.join('\n'));
}

/**
 * The default options to use for the renderer.
 *
 * @typedef {Object} SectionOptions
 * @property {function(Object): string} render The function to use to render this section.
 *
 * @typedef {Object} RenderOptions
 * @property {string} documentClass The documentclass to use for the output.
 * @property {string} preamble The preamble to use in the output.
 * @property {function(Resume): string} renderHeader The function to use for rendering the header.
 * @property {function(string): string} renderSummary The function to use for rendering the summary.
 * @property {Array.<string>} sections The sections to output, in the order they should appear.
 * @property {Object.<string, SectionOptions>} sectionOptions Options for each section.
 *
 * @type {RenderOptions}
 */
const defaultOptions = {
  documentClass: 'article',
  preamble: '',
  renderHeader,
  renderSummary,
  sections: [
    'work',
    'volunteer',
    'education',
    'awards',
    'publications',
    'skills',
  ],
  sectionOptions: {
    work: {
      render: renderWork,
    },
    volunteer: {
      render: renderVolunteer,
    },
    education: {
      render: renderEducation,
    },
    awards: {
      render: renderAwards,
    },
    publications: {
      render: renderPublications,
    },
    skills: {
      render: renderSkills,
    },
  },
};

/**
 * Return a render function that renders resume data in LaTeX format.
 *
 * @param {RenderOptions} [options] The options to use for the renderer.
 *
 * @returns {function} The render function.
 */
function makeTheme(options = defaultOptions) {
  // Provide values for unspecified options.
  options = Object.assign(defaultOptions, options);

  return resume => {
    return `\\documentclass{${options.documentClass}}
${options.preamble}
\\begin{document}
${options.renderHeader(resume)}
${options.renderSummary(resume.basics.summary)}
${options.sections
      .map(section => options.sectionOptions[section].render(resume[section]))
      .join('\n')}
\\end{document}
`;
  };
}

const preamble = fs.readFileSync(path.join(__dirname, 'preamble.tex'));
const render = makeTheme({ preamble });

module.exports = {
  makeTheme,
  render,
};

const resume = JSON.parse(fs.readFileSync(path.join(__dirname, 'resume.json')));
console.log(render(resume));
