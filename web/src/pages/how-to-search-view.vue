<template>
<div class="space-y-2">
  <h2>How to Search?</h2>
  <h4 class="mt-4">Usage</h4>
  <p>Just type your request in plain words in the <a href="#/">search box</a>.</p>
  <h5>Examples</h5>
  <ul>
    <li class="font-monospace">Divine Comedy Dante</li>
    <li class="font-monospace">doi:10.1159/000477855</li>
    <li>Search by author:&nbsp;</li>
      <span class="font-monospace">authors:Jack authors:London</span>
    <li>Exact match:&nbsp;</li>
      <span class="font-monospace">"Fetal Hemoglobin"</span>
    <li>Filter formats (all except pdf):&nbsp;</li>
      <span class="font-monospace">+JavaScript extension:+epub</span>
    <li>All about JavaScript in Russian language:&nbsp;</li>
      <span class="font-monospace">+JavaScript language:+ru</span>
    <li>All about JavaScript excluding things in Russian language:&nbsp;</li>
      <span class="font-monospace">+JavaScript language:-ru</span>
  </ul>
  <h5>List of fields</h5>
  <p>abstract, ark_id, authors, concepts, content, doi, ev (event), extra (see below), isbns, issued_at (in Unixtime), issns, pmid (pubmed_id), pub (publisher), ser (series), tags, title, type</p>
  <h5>Item types</h5>
  <p>book, book-chapter, chapter, chapter, dataset, component, dissertation, edited-book, journal-article, monograph, peer-review, proceedings, proceedings-article, reference-book, report, standard</p>
  <h5>Extra field</h5>
  <p>Contains out-of-scheme fields, for example - ISO/BS standard numbers that can be used in the following way:</p>
  <p><span class="font-monospace">extra:"iso iec 10279 1991"</span></p>
  <h5>Extended syntax</h5>
  <p><span class="font-monospace">+</span> sign makes words or filtration by field mandatory</p>
  <ul>
    <li><span class="font-monospace">+JavaScript language:en</span> returns <b>all</b> JavaScript books but books in English will be ranked higher</li>
    <li><span class="font-monospace">+JavaScript language:+en</span> returns JavaScript books <b>only</b> in English</li>
  </ul>
  <p><span class="font-monospace">-</span> sign removes documents</p>
  <ul>
    <li><span class="font-monospace">+JavaScript language:-en</span> returns JavaScript books <b>only</b> non-English books</li>
  </ul>
</div>
</template>
<script setup lang="ts">
import {get_label} from "@/translations";

document.title = `How to Search? - Help - STC`;
</script>
