/*
 * Copyright 2018 Ian Johnson
 *
 * This file is part of jsonresume-theme-latex, a free software project
 * distributed under the terms of the MIT License.  A copy of the license can be
 * found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
const fs = require('fs');
const makeTheme = require('./make-theme');
const path = require('path');

const preamble = fs.readFileSync(path.join(__dirname, 'preamble.tex'));
const render = makeTheme({ preamble });

module.exports = { render };

const resume = JSON.parse(fs.readFileSync(path.join(__dirname, 'resume.json')));
console.log(render(resume));
