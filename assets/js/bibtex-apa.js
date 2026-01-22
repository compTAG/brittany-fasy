/**
 * BibTeX to APA Citation Generator
 * Parses BibTeX files and renders citations in APA format
 */

(function() {
  'use strict';

  // Parse a BibTeX file into an array of entry objects
  function parseBibTeX(bibtex) {
    const entries = [];
    // Remove comments (lines starting with %)
    const lines = bibtex.split('\n');
    const cleanedLines = lines.filter(line => !line.trim().startsWith('%'));
    const cleanedBibtex = cleanedLines.join('\n');

    // Match entry blocks: @type{key, ... }
    const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,([^@]*?)(?=\n\s*@|\n*$)/gs;
    let match;

    while ((match = entryRegex.exec(cleanedBibtex)) !== null) {
      const type = match[1].toLowerCase();
      const key = match[2].trim();
      const fieldsStr = match[3];

      // Skip string definitions and comments
      if (type === 'string' || type === 'comment' || type === 'preamble') {
        continue;
      }

      const fields = parseFields(fieldsStr);
      entries.push({ type, key, ...fields });
    }

    return entries;
  }

  // Parse the fields within a BibTeX entry
  function parseFields(fieldsStr) {
    const fields = {};
    // Match field = value pairs, handling braces and quotes
    const fieldRegex = /(\w+)\s*=\s*(?:\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)"|(\d+))/g;
    let match;

    while ((match = fieldRegex.exec(fieldsStr)) !== null) {
      const name = match[1].toLowerCase();
      const value = (match[2] || match[3] || match[4] || '').trim();
      fields[name] = cleanLaTeX(value);
    }

    return fields;
  }

  // Clean LaTeX commands and special characters
  function cleanLaTeX(str) {
    if (!str) return '';

    return str
      // Handle accents
      .replace(/\\'\{?([aeiouAEIOU])\}?/g, (m, c) => {
        const accents = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' };
        return accents[c] || c;
      })
      .replace(/\\`\{?([aeiouAEIOU])\}?/g, (m, c) => {
        const accents = { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', A: 'À', E: 'È', I: 'Ì', O: 'Ò', U: 'Ù' };
        return accents[c] || c;
      })
      .replace(/\\"?\{?([aeiouAEIOU])\}?/g, (m, c) => {
        const accents = { a: 'ä', e: 'ë', i: 'ï', o: 'ö', u: 'ü', A: 'Ä', E: 'Ë', I: 'Ï', O: 'Ö', U: 'Ü' };
        return accents[c] || c;
      })
      .replace(/\\=\{?([aeiouAEIOU])\}?/g, (m, c) => {
        const macrons = { a: 'ā', e: 'ē', i: 'ī', o: 'ō', u: 'ū', A: 'Ā', E: 'Ē', I: 'Ī', O: 'Ō', U: 'Ū' };
        return macrons[c] || c;
      })
      .replace(/\\c\{([cC])\}/g, (m, c) => c === 'c' ? 'ç' : 'Ç')
      .replace(/\\c\{([sS])\}/g, (m, c) => c === 's' ? 'ş' : 'Ş')
      // Handle special characters
      .replace(/\{\\ss\}/g, 'ß')
      .replace(/\\ss\b/g, 'ß')
      // Remove remaining braces (used for capitalization protection)
      .replace(/\{([^{}]*)\}/g, '$1')
      // Handle math mode for simple cases
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\\mathbb\{([^}]+)\}/g, '$1')
      // Handle common commands
      .replace(/\\&/g, '&')
      .replace(/\\_/g, '_')
      .replace(/\\%/g, '%')
      .replace(/\\#/g, '#')
      .replace(/\\ /g, ' ')
      .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
      .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
      .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Parse author string into array of {first, last} objects
  function parseAuthors(authorStr) {
    if (!authorStr) return [];

    // Split by " and " (case insensitive)
    const authors = authorStr.split(/\s+and\s+/i);

    return authors.map(author => {
      author = author.trim();

      // Handle "Last, First" format
      if (author.includes(',')) {
        const parts = author.split(',').map(p => p.trim());
        return { last: parts[0], first: parts.slice(1).join(' ') };
      }

      // Handle "First Last" format
      const parts = author.split(/\s+/);
      if (parts.length === 1) {
        return { last: parts[0], first: '' };
      }

      const last = parts.pop();
      return { last, first: parts.join(' ') };
    });
  }

  // Format authors in APA style
  function formatAuthorsAPA(authors) {
    if (authors.length === 0) return '';

    const formatted = authors.map((a, i) => {
      // Get initials from first name
      const initials = a.first
        .split(/[\s.-]+/)
        .filter(p => p.length > 0)
        .map(p => p[0].toUpperCase() + '.')
        .join(' ');

      return `${a.last}, ${initials}`.trim().replace(/,\s*$/, '');
    });

    if (formatted.length === 1) {
      return formatted[0];
    } else if (formatted.length === 2) {
      return `${formatted[0]} & ${formatted[1]}`;
    } else if (formatted.length <= 20) {
      const last = formatted.pop();
      return `${formatted.join(', ')}, & ${last}`;
    } else {
      // More than 20 authors: first 19, ..., last
      const first19 = formatted.slice(0, 19);
      const last = formatted[formatted.length - 1];
      return `${first19.join(', ')}, ... ${last}`;
    }
  }

  // Format a single entry in APA style
  function formatAPA(entry) {
    const authors = parseAuthors(entry.author);
    const authorStr = formatAuthorsAPA(authors);
    const year = entry.year || 'n.d.';
    const title = entry.title || '';

    let citation = '';

    switch (entry.type) {
      case 'article':
        citation = formatArticle(authorStr, year, title, entry);
        break;
      case 'inproceedings':
      case 'conference':
        citation = formatInProceedings(authorStr, year, title, entry);
        break;
      case 'book':
        citation = formatBook(authorStr, year, title, entry);
        break;
      case 'incollection':
        citation = formatInCollection(authorStr, year, title, entry);
        break;
      case 'phdthesis':
      case 'mastersthesis':
        citation = formatThesis(authorStr, year, title, entry);
        break;
      case 'misc':
      case 'unpublished':
        citation = formatMisc(authorStr, year, title, entry);
        break;
      default:
        citation = formatDefault(authorStr, year, title, entry);
    }

    return citation;
  }

  function formatArticle(authorStr, year, title, entry) {
    let citation = `${authorStr} (${year}). ${title}.`;

    if (entry.journal) {
      citation += ` <em>${entry.journal}</em>`;
      if (entry.volume) {
        citation += `, <em>${entry.volume}</em>`;
        if (entry.number || entry.issue) {
          citation += `(${entry.number || entry.issue})`;
        }
      }
      if (entry.pages) {
        citation += `, ${entry.pages}`;
      }
      citation += '.';
    }

    if (entry.doi) {
      citation += ` https://doi.org/${entry.doi}`;
    }

    return citation;
  }

  function formatInProceedings(authorStr, year, title, entry) {
    let citation = `${authorStr} (${year}). ${title}.`;

    if (entry.booktitle) {
      citation += ` In <em>${entry.booktitle}</em>`;
      if (entry.pages) {
        citation += ` (pp. ${entry.pages})`;
      }
      citation += '.';
    }

    if (entry.publisher) {
      citation += ` ${entry.publisher}.`;
    }

    if (entry.doi) {
      citation += ` https://doi.org/${entry.doi}`;
    }

    return citation;
  }

  function formatBook(authorStr, year, title, entry) {
    let citation = `${authorStr} (${year}). <em>${title}</em>.`;

    if (entry.publisher) {
      if (entry.address) {
        citation += ` ${entry.address}:`;
      }
      citation += ` ${entry.publisher}.`;
    }

    return citation;
  }

  function formatInCollection(authorStr, year, title, entry) {
    let citation = `${authorStr} (${year}). ${title}.`;

    if (entry.booktitle) {
      citation += ` In`;
      if (entry.editor) {
        const editors = parseAuthors(entry.editor);
        const editorStr = formatAuthorsAPA(editors);
        citation += ` ${editorStr} (Ed${editors.length > 1 ? 's' : ''}.),`;
      }
      citation += ` <em>${entry.booktitle}</em>`;
      if (entry.pages) {
        citation += ` (pp. ${entry.pages})`;
      }
      citation += '.';
    }

    if (entry.publisher) {
      citation += ` ${entry.publisher}.`;
    }

    return citation;
  }

  function formatThesis(authorStr, year, title, entry) {
    const thesisType = entry.type === 'phdthesis' ? 'Doctoral dissertation' : 'Master\'s thesis';
    let citation = `${authorStr} (${year}). <em>${title}</em> [${thesisType}`;

    if (entry.school) {
      citation += `, ${entry.school}`;
    }

    citation += '].';

    return citation;
  }

  function formatMisc(authorStr, year, title, entry) {
    let citation = '';

    if (authorStr) {
      citation += `${authorStr} `;
    }

    citation += `(${year}). ${title}.`;

    if (entry.note) {
      citation += ` ${entry.note}`;
    }

    if (entry.howpublished) {
      citation += ` ${entry.howpublished}`;
    }

    return citation;
  }

  function formatDefault(authorStr, year, title, entry) {
    let citation = `${authorStr} (${year}). ${title}.`;

    if (entry.note) {
      citation += ` ${entry.note}`;
    }

    return citation;
  }

  // Categorize entries by type for display
  function categorizeEntries(entries) {
    const categories = {
      'Journal Articles': [],
      'Conference Papers': [],
      'Book Chapters': [],
      'Theses': [],
      'Other Publications': []
    };

    entries.forEach(entry => {
      switch (entry.type) {
        case 'article':
          categories['Journal Articles'].push(entry);
          break;
        case 'inproceedings':
        case 'conference':
          categories['Conference Papers'].push(entry);
          break;
        case 'incollection':
        case 'book':
          categories['Book Chapters'].push(entry);
          break;
        case 'phdthesis':
        case 'mastersthesis':
          categories['Theses'].push(entry);
          break;
        default:
          categories['Other Publications'].push(entry);
      }
    });

    return categories;
  }

  // Sort entries by year (descending), then by author
  function sortEntries(entries) {
    return entries.sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      if (yearB !== yearA) return yearB - yearA;

      const authA = (a.author || '').toLowerCase();
      const authB = (b.author || '').toLowerCase();
      return authA.localeCompare(authB);
    });
  }

  // Render publications to the page
  function renderPublications(entries, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    // Filter entries based on options
    let filteredEntries = entries;

    // Filter for featured publications only
    if (options.featuredOnly) {
      filteredEntries = filteredEntries.filter(e => {
        const featured = (e.featured || '').toLowerCase();
        return featured === 'true' || featured === 'yes' || featured === '1';
      });
    }

    if (options.excludeInPreparation) {
      filteredEntries = filteredEntries.filter(e => {
        const note = (e.note || '').toLowerCase();
        return !note.includes('in preparation') && !note.includes('wip');
      });
    }

    // Sort entries
    const sortedEntries = sortEntries(filteredEntries);

    // Handle empty results
    if (sortedEntries.length === 0) {
      container.innerHTML = '<p>No publications found.</p>';
      return;
    }

    let html = '';

    if (options.simpleList) {
      // Simple list without grouping (for featured publications)
      html += `<ul class="publications-list">\n`;
      sortedEntries.forEach(entry => {
        const citation = formatAPA(entry);
        html += `  <li class="publication-item">${citation}</li>\n`;
      });
      html += `</ul>\n`;
    } else if (options.groupByType) {
      const categories = categorizeEntries(sortedEntries);

      for (const [category, catEntries] of Object.entries(categories)) {
        if (catEntries.length === 0) continue;

        html += `<h2>${category}</h2>\n<ul class="publications-list">\n`;
        catEntries.forEach(entry => {
          const citation = formatAPA(entry);
          html += `  <li class="publication-item">${citation}</li>\n`;
        });
        html += `</ul>\n`;
      }
    } else {
      // Group by year
      const byYear = {};
      sortedEntries.forEach(entry => {
        const year = entry.year || 'n.d.';
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(entry);
      });

      const years = Object.keys(byYear).sort((a, b) => {
        const ya = parseInt(a) || 0;
        const yb = parseInt(b) || 0;
        return yb - ya;
      });

      years.forEach(year => {
        html += `<h2>${year}</h2>\n<ul class="publications-list">\n`;
        byYear[year].forEach(entry => {
          const citation = formatAPA(entry);
          html += `  <li class="publication-item">${citation}</li>\n`;
        });
        html += `</ul>\n`;
      });
    }

    container.innerHTML = html;
  }

  // Main function to load and render publications
  async function loadPublications(bibUrl, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = '<p>Loading publications...</p>';

    try {
      const response = await fetch(bibUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${bibUrl}: ${response.status}`);
      }

      const bibtex = await response.text();
      const entries = parseBibTeX(bibtex);
      renderPublications(entries, containerId, options);
    } catch (error) {
      console.error('Error loading publications:', error);
      container.innerHTML = `<p>Error loading publications: ${error.message}</p>`;
    }
  }

  // Expose to global scope
  window.BibtexAPA = {
    parseBibTeX,
    formatAPA,
    renderPublications,
    loadPublications
  };
})();
