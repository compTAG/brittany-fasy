---
title: Overview
permalink: /research/home/
redirect_from: /research/index.html
---

Brittany Terese Fasy is a researcher in topological data analysis.
She started a research group [TDA at MSU](https://www.cs.montana.edu/tda/) in Fall 2015.
The group meets weekly to discuss fundamental topics, recent research papers, and current research of group members.
More information on Dr. Fasy can be found in her
<a href="../../assets/fasy-brittany-rsrch-stmt.pdf">formal research statement</a>,
or by navigating through this site.

Please visit the [projects page](/brittany-fasy/research/projects/) to learn
more about her work on grant funded projects,
or the [publications page](/brittany-fasy/research/publications/)
for a full list of publications.

### Featured Publications

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
</style>

<div id="featured-publications-list">
  <p>Loading featured publications...</p>
</div>

<script src="{{ '/assets/js/bibtex-apa.js' | relative_url }}"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  BibtexAPA.loadPublications(
    '{{ "/assets/publications/biblio.bib" | relative_url }}',
    'featured-publications-list',
    {
      featuredOnly: true,
      excludeInPreparation: true,
      simpleList: true
    }
  );
});
</script>

