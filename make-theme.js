/*
 * A helper class for creating themes from a very basic template.
 *
 * Copyright 2018 Ian Johnson
 *
 * This file is part of jsonresume-theme-latex, a free software project
 * distributed under the terms of the MIT License.  A copy of the license can be
 * found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Escape any LaTeX special characters in the given string.
 *
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function escape(str) {
  // TODO: complete the implementation.
  return str;
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
 * @returns {string} The code within the environment.
 */
function useEnvironment(env, code) {
  return `\\begin{${env}}
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

  let contents = `\\name{${name}}\n`;
  if (label) {
    contents += `\\personallabel{${label}}\n`;
  }
  if (location) {
    contents += `\\location{${location.address.replace('\n', ' \\\\ ')} \\\\ ${
      location.city
    }, ${location.postalCode}}\n`;
  }
  if (email) {
    contents += `\\email{${email}}\n`;
  }
  if (phone) {
    const rawPhone = phone.replace(/[^+0-9]/g, '');
    const formattedPhone = formatPhone(rawPhone);
    contents += `\\phone{${rawPhone}}{${formattedPhone}}\n`;
  }
  if (website) {
    contents += `\\website{${website}}\n`;
  }

  return useEnvironment('header', contents.trim());
}

/**
 * Render the resume summary.
 *
 * @param {Resume} resume The resume data.
 * @returns {string} The rendered summary.
 */
function renderSummary(resume) {
  const summary = resume.basics.summary;

  return summary
    ? `\\summary{${summary}}`
    : '\\ignorespaces % Summary would go here';
}

/**
 * The default options to use for the renderer.
 *
 * @typedef {Object} RenderOptions
 * @property {string} documentClass The documentclass to use for the output.
 * @property {string} preamble The preamble to use in the output.
 * @property {function(Resume): string} renderHeader The function to use for rendering the header.
 * @property {function(Resume): string} renderSummary The function to use for rendering the summary.
 */
const defaultOptions = {
  documentClass: 'article',
  preamble: '',
  renderHeader,
  renderSummary,
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
${options.renderSummary(resume)}
\\end{document}
`;
  };
}

module.exports = makeTheme;
