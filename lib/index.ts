/**
 * @file The contents of the module.
 * @author Ian Johnson
 * @copyright 2018 Ian Johnson
 * @license MIT
 */
import moment from 'moment';

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
export function escape(str: string): string {
  if (!str) {
    return '';
  }
  // Uses the approach described in https://stackoverflow.com/a/15604206.
  // TODO: complete the implementation by filling in more escapes.
  const escapes: { [key: string]: string } = {
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
export function indent(code: string): string {
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
export function useEnvironment(
  env: string,
  code: string,
  ...args: string[]
): string {
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
export function formatPhone(phone: string): string {
  let country = '';
  if (phone[0] === '+' || phone.length > 10) {
    // Country code included.
    country = phone.slice(0, -10);
    phone = phone.slice(-10);
  }
  const formatted = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}--${phone.slice(
    6,
    10,
  )}`;

  return country ? `${country} ${formatted}` : formatted;
}

/**
 * Renders the resume header.
 *
 * @param resume the resume data
 * @returns the rendered header
 */
export function renderHeader(resume: any): string {
  const { name, label, email, phone, website, location } = resume.basics;

  const contents = [`\\name{${escape(name)}}`];
  if (label) {
    contents.push(`\\personallabel{${escape(label)}}`);
  }
  if (location) {
    contents.push(
      `\\location{${escape(location.address)} \\\\ ${escape(
        location.city,
      )}, ${escape(location.postalCode)}}`,
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
 * Renders the resume summary.
 *
 * @param summary the summary to render
 * @returns the rendered summary
 */
export function renderSummary(summary: string): string {
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
export function renderWork(work?: any[]): string {
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
    const jobInfo = [];
    if (job.summary) {
      jobInfo.push(`\\jobsummary{${escape(job.summary)}}`);
    }
    if (job.highlights) {
      jobInfo.push(
        useEnvironment(
          'jobhighlights',
          (job.highlights as string[])
            .map(highlight => `\\item ${escape(highlight)}`)
            .join('\n'),
        ),
      );
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
export function renderVolunteer(volunteer?: any[]): string {
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
    const positionInfo = [];
    if (position.summary) {
      positionInfo.push(`\\positionsummary{${escape(position.summary)}}`);
    }
    if (position.highlights) {
      positionInfo.push(
        useEnvironment(
          'positionhighlights',
          (position.highlights as string[])
            .map(highlight => `\\item ${escape(highlight)}`)
            .join('\n'),
        ),
      );
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
export function renderEducation(education?: any[]): string {
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
          (school.courses as string[])
            .map(course => `\\item ${escape(course)}`)
            .join('\n'),
        )
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
export function renderAwards(awards?: any[]): string {
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
 * Renders the publications section.
 *
 * @param publications the publications section of the resume
 * @returns the formatted section
 */
export function renderPublications(publications?: any[]): string {
  if (!publications) {
    return '% Publications section omitted.';
  }

  const formattedPublications = publications.map(publication => {
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
 * Renders the skills section.
 *
 * @param skills the skills section of the resume
 * @returns the formatted section
 */
export function renderSkills(skills?: any[]): string {
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
export function renderLanguages(languages?: any[]): string {
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
export function renderInterests(interests?: any[]): string {
  if (!interests) {
    return '% Interests section omitted.';
  }

  const formattedInterests = interests.map(
    interest => `\\item ${escape(interest.name)}`,
  );
  return useEnvironment('interests', formattedInterests.join('\n'));
}

/**
 * Renders the references section.
 *
 * @param references the references section of the resume
 * @returns the formatted section
 */
export function renderReferences(references?: any[]): string {
  if (!references) {
    return '% References section omitted.';
  }

  const formattedReferences = references.map(
    reference =>
      `\\reference{${escape(reference.name)}} ${escape(reference.reference)}`,
  );
  return useEnvironment('references', formattedReferences.join('\n'));
}

/**
 * Renders the projects section.
 *
 * @param projects the projects section of the resume
 * @returns the formatted section
 */
export function renderProjects(projects?: any[]): string {
  if (!projects) {
    return '% Projects section omitted.';
  }
  const formattedProjects = projects.map(project => {
    const name = project.url
      ? `\\href{${project.url}}{${escape(project.name)}}`
      : escape(project.name);
    const roles = project.roles ? project.roles.join(', ') : '';
    const startDate = moment(project.startDate).format(DATE_FORMAT);
    const endDate = project.endDate
      ? moment(project.endDate).format(DATE_FORMAT)
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
      projectInfo.push(
        useEnvironment(
          'projecthighlights',
          (project.highlights as string[])
            .map(highlight => `\\item ${escape(highlight)}`)
            .join('\n'),
        ),
      );
    }

    return useEnvironment('project', projectInfo.join('\n'), ...args);
  });
  return useEnvironment('projects', formattedProjects.join('\n'));
}

/**
 * Options for rendering a single section of the resume.
 */
export interface SectionOptions<T> {
  /**
   * The function to use to render this section.
   *
   * @param sectionData the data of the section to render
   */
  render(sectionData: T): string;
}

/**
 * Global options for rendering a resume.
 */
export interface RenderOptions {
  /**
   * The documentclass to use for the output.
   */
  documentClass: string;
  /**
   * The preamble to use in the output.
   */
  preamble: string;
  /**
   * The sections to output, in the order they should appear.
   */
  sections: string[];
  /**
   * The options for each section.
   */
  sectionOptions: { [key: string]: SectionOptions<any> };
  /**
   * The function to use for rendering the header.
   *
   * @param resume the resume data
   */
  renderHeader(resume: any): string;
  /**
   * The function to use for rendering the resume summary.
   *
   * @param summary the summary string
   */
  renderSummary(summary: string): string;
}

/**
 * The default options to use for the renderer.
 */
export const defaultOptions: RenderOptions = {
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

export type RenderFunction = (resume: any) => string;

/**
 * Returns a render function that renders resume data in LaTeX format.
 *
 * @param options the options to use for the renderer
 *
 * @returns the render function
 */
export function makeTheme(
  options: Partial<RenderOptions> = defaultOptions,
): RenderFunction {
  // Provide values for unspecified options.
  const allOptions: RenderOptions = Object.assign(defaultOptions, options);

  return resume => {
    return `\\documentclass{${allOptions.documentClass}}
${allOptions.preamble}
\\begin{document}
${allOptions.renderHeader(resume)}
${allOptions.renderSummary(resume.basics.summary)}
${allOptions.sections
      .map(section =>
        allOptions.sectionOptions[section].render(resume[section]),
      )
      .join('\n')}
\\end{document}
`;
  };
}
