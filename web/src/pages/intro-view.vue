<template>
<div class="max-w-screen-md mx-auto md:w-3/4 space-y-2">
  <h2 class="text-3xl custom-header">Welcome, seeker!</h2>
  <p class="mt-4">欢迎，探索者！- आपका स्वागत है, साधक! - ¡Bienvenido buscador! - Bem-vindo, buscador! - مرحبًا بك أيها الباحث! - Добро пожаловать, искатель!</p>
  <ul class="mt-4 list-disc list-inside">
    <li>
      <a
          class="custom-link"
          href="#/stc/id:86aob6tp35m6915oa2gne4z69">English through pictures
      </a>
    </li>
    <li>
      <a
          class="custom-link"
          href="#/?q=english+for+beginners">Further sources for learning English
      </a>
    </li>
  </ul>
  <h4 class="text-xl custom-header mt-4">About</h4>
  <p>You have met a full or partial installation of The Standard Template Construct (STC) stamped as <b>{{ stamp }}</b>.</p>
  <p>The STC is a self-replicating search engine that grants sentient beings free and convenient access to knowledge discovered by the human race throughout its age of science and digital era.</p>
  <p>Founded in 2021 year (Terra Time, Gregorian Calendar), the STC relies upon <a class="custom-link" href="https://github.com/izihawa/summa">Summa</a>, <a class="custom-link" href="https://webassembly.org/">WASM</a> and <a class="custom-link" href="https://ipfs.io/">IPFS</a> for its operation.</p>
  <p>The STC is a pure peer-to-peer system without a centralized server. Queries made through the platform remain within the user's browser and/or distributed across semi-random peers.</p>
  <hr class="custom-separator"/>

  <h4 class="text-xl custom-header mt-4">Access to STC</h4>
  <p>The STC is distributed through IPFS, an uncensorable distributed network. When using STC, you download portions of the library from multiple peers to your local computer for offline use.</p>
  <p>You may have accessed this page through the public gateway. While this method is convenient, it's not always reliable because public gateways can potentially censor this site.</p>
  <p>In this case, you'll need to install and configure specific software on your computer to access this site directly from the IPFS network.</p>
  <h5 class="text-lg custom-header">Step 1: Install and Launch IPFS Desktop and Launch</h5>
  <p>Follow the <a class="custom-link" href="https://docs.ipfs.tech/install/ipfs-desktop/" target="_blank">official guide</a> to install IPFS Desktop. Do not forget to launch IPFS Desktop before the next step.</p>
  <h5 class="text-lg custom-header">Step 2: Install IPFS Companion for Your Browser</h5>
  <p>The IPFS Companion is a browser extension that provides a smoother experience with IPFS. Follow the <a class="custom-link" href="https://docs.ipfs.tech/install/ipfs-companion/" target="_blank">official guide</a> to install the appropriate extension for your browser.</p>
  <h5 class="text-lg custom-header">Step 3: Refresh Page</h5>
  <p>Everything is ready, you just need to <a class="custom-link" href="https://libstc.cc" target="_blank">open STC</a> again. STC will be reloaded from local IPFS daemon.</p>

  <hr class="custom-separator"/>
  <img class="object-fill" id="origin" src="@/assets/img/origin.jpg" alt="origin"/>
</div>
</template>
<script setup lang="ts">
import {stamp} from '../translations'
document.title = 'Welcome - STC'
</script>

<style scoped>
#origin {
  border-width: 20px;
  border-radius: 20px;
  border-color: #111111;
  border-style: solid;
}
</style>
