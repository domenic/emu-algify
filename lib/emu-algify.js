'use strict';
const fs = require('pn/fs');
const jsdom = require('jsdom');
const EmuSpec = require('ecmarkup/lib/Spec');
const EmuAlgorithm = require('ecmarkup/lib/Algorithm');
const EmuXref = require('ecmarkup/lib/Xref');

module.exports = (inputText, options) => {
  if (options === undefined) {
    options = {};
  }
  const throwingIndicators = Boolean(options.throwingIndicators);

  return Promise.resolve().then(() => {
    const doc = jsdom.jsdom(inputText);

    const spec = new EmuSpec('dummy path', read, doc, { toc: false, copyright: false });

    return Promise.all([
      spec.loadES6Biblio(),
      spec.loadBiblios()
    ])
    .then(() => {
      addAllAOIDsToBiblio(spec);

      if (throwingIndicators) {
        addThrowingIndicatorTags(spec.doc);
      }
      return spec.buildAll('emu-alg', EmuAlgorithm);
    })
    .then(() => spec.autolink())
    .then(() => spec.buildAll('emu-xref', EmuXref))
    .then(() => jsdom.serializeDocument(spec.doc));
  });
};

function read(path) {
  return fs.readFile(path, { encoding: 'utf-8' });
}

function addAllAOIDsToBiblio(spec) {
  // Allow aoid="" anywhere. Ecmarkup's default configuration only scans for them when building, and even then only on
  // <emu-clause> and <emu-alg>.

  const aos = spec.doc.querySelectorAll('[aoid]');
  const biblioEntries = [...aos].map(ao => {
    const aoid = ao.getAttribute('aoid');
    const id = ao.id;

    return {
      type: 'op',
      aoid: aoid,
      id: id,
      key: aoid
    }
  });

  spec.biblio.addExternalBiblio({ "": biblioEntries });
}

function addThrowingIndicatorTags(doc) {
  const aos = doc.querySelectorAll('[aoid]');
  for (const ao of aos) {
    const hasThrows = ao.hasAttribute('throws');
    const hasNothrow = ao.hasAttribute('nothrow');

    if ((!hasThrows && !hasNothrow) || (hasThrows && hasNothrow)) {
      throw new Error('All abstract operations must be notated with exactly one of the throws or nothrow ' +
        `attributes. Check the abstract operation with aoid="${ao.getAttribute('aoid')}"`);
    }

    const labelEl = doc.createElement('span');
    labelEl.className = 'annotation';
    labelEl.textContent = hasThrows ? 'throws' : 'nothrow';
    labelEl.title = hasThrows ? 'can return an abrupt completion' : 'never returns an abrupt completion';

    const insertBeforeThis = ao.querySelector('.self-link');
    ao.insertBefore(labelEl, insertBeforeThis);
    ao.insertBefore(doc.createTextNode(' '), labelEl);
  }
}
