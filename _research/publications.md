---
title: Publications
permalink: /research/publications/
---

<style>
.publications-list {
  list-style-type: none;
  padding-left: 0;
}

.publication-item {
  margin-bottom: 1em;
  padding-left: 2em;
  text-indent: -2em;
  line-height: 1.5;
}

.publication-item em {
  font-style: italic;
}

#publications-container h2 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.25em;
}

#publications-container h2:first-child {
  margin-top: 0;
}
</style>

<div id="publications-container">
  <p>Loading publications...</p>
</div>

<script src="{{ '/assets/js/bibtex-apa.js' | relative_url }}"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  BibtexAPA.loadPublications(
    '{{ "/assets/publications/biblio.bib" | relative_url }}',
    'publications-container',
    {
      groupByType: false,
      excludeInPreparation: true
    }
  );
});
</script>
