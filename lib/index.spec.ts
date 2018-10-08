/**
 * @file tests for the module
 * @author Ian Johnson
 * @copyright 2018 Ian Johnson
 * @license MIT
 */
import { expect } from 'chai';
import 'mocha';

import { render } from './index';

import completeResume from '@ianprime0509/jsonresume-schema/examples/valid/complete.json';

describe('render', () => {
  it('renders a valid resume', () => {
    expect(render(completeResume)).to.be.a('string').that.is.not.empty;
  });
});
