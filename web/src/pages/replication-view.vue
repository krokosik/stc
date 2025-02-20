<template>
<div class="max-w-screen-md mx-auto md:w-3/4 space-y-2">
  <h2 class="text-3xl custom-header">Replication</h2>
  <p>
    The STC can be replicated entirely, including the database, web interface, and all files (optionally), to your server or PC without the need to build or launch anything.
    The only requirement is having IPFS installed, as the entire approach
    is based on the <a class="custom-link" href="https://izihawa.github.io/summa/blog/mitigating-internet-censorship-and-privacy-issues/">peer-to-peer mode</a> of the Summa search engine.
  </p>
  <p>
    <a href="https://docs.ipfs.tech/install/ipfs-desktop/" class="custom-link">Install IPFS</a> and, optionally, <a class="custom-link" href="https://docs.ipfs.tech/install/ipfs-companion/">IPFS Companion</a> for your browser and then pin entire STC or its parts depending on you needs:
  </p>
  <div class="relative overflow-x-auto mt-5">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr>
        <th scope="col" class="px-6 py-3">
          Description
        </th>
        <th scope="col" class="px-6 py-3">
          Command for pinning
        </th>
      </tr>
      </thead>
      <tbody>
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
          Web-interface and search database
        </th>
        <td class="px-6 py-4 break-all font-mono">
          ipfs pin add /ipns/libstc.cc
        </td>
      </tr>
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
          Directory with DOI-named files
        </th>
        <td class="px-6 py-4 break-all font-mono">
          ipfs pin add /ipns/dois.libstc.cc
        </td>
      </tr>
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
          Directory with Nexus ID named files
        </th>
        <td class="px-6 py-4 break-all font-mono">
          ipfs pin add /ipns/repo.libstc.cc
        </td>
      </tr>
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
          Search data
        </th>
        <td class="px-6 py-4 break-all font-mono">
          ipfs pin add /ipns/libstc.cc/data
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <p class="mt-1">
    Having things pinned means you have a local copy of it and seed parts of the library to others.
  </p>
  <p>
    STC is updated and rotated periodically. To maintain an up-to-date state, you may want to re-pin everything you need from time to time.
    IPFS will only pull the changes, meaning that further updates won’t require re-downloading everything.
  </p>
  <h4 class="text-xl custom-header">Setting up gateway</h4>
  <p>
    A gateway allows you to make your own replicated instance of STC available to others via their browsers, not only using IPFS.
    It may be useful for extending access to those who cannot configure IPFS on their own.
    For setting up a gateway purpose, you need to have a domain name attached to your server with an IPFS instance,
    along with a configured Nginx or another reverse proxy for better security and configurability.
    The IPFS daemon must be configured as a subdomain gateway in <span class="font-mono text-sm">~/.ipfs/config</span>.
  </p>
  <div>
    <code class="block whitespace-pre-wrap text-xs border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-700 p-2">
      {{ ipfs_config }}
    </code>
  </div>
  <p>
    Then, configure Nginx reverse proxy in the following way
  </p>
  <div class="space-y-2">
    <code class="block whitespace-pre-wrap text-xs border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-700 p-2">
      {{ nginx_config }}
    </code>
    <p>
      For better reliability you may also replace DNSLink names with their real IPFS hashes. This way you will be protected from
      DNS name shutdown.
    </p>
  </div>
  <h4 class="text-xl custom-header mt-2">Search locally with GECK</h4>
  <p>GECK is a Python library for communicating with STC.</p>
  <code class="block whitespace-pre-wrap text-xs border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-700 p-2">
    {{ geck_example }}
  </code>
  <p>
    More examples may be found at <a class="custom-link" href="https://github.com/ultranymous/stc">GitHub</a>
  </p>
</div>
</template>
<script setup lang="ts">
document.title = 'Replication - STC'

const ipfs_config = `{
  "Gateway": {
    "PublicGateways": {
      "your-gateway.org": {
        "UseSubdomains": true,
        "Paths": [
          "/ipfs",
          "/ipns"
        ]
      }
    }
  }
}`

const nginx_config = `worker_processes  8;
worker_rlimit_nofile 8192;
events {
  worker_connections  4096;
}

http {
  proxy_cache_path /var/www/cache keys_zone=mycache:600m;
  proxy_temp_path /var/www/cache/tmp;

  proxy_cache_path /var/cache/nginx/auth_cache levels=1:2 keys_zone=auth_cache:1m max_size=1g inactive=60m;

  server {
    server_name     your-gateway.org;
    location / {
      proxy_pass http://127.0.0.1:8080;
      proxy_set_header Host libstc.cc.ipns.your-gateway.org;
    }

    # Following location is used for configuring on how to process file requests.
    # Option 1: Forward to upstream which redirects to IPFS through a chain of public hosts.
    # Requires nothing from STC replicator but may be disrupted by public hosts used in the chain of redirection.
    location ~* /repo {
      proxy_pass http://127.0.0.1:8080;
      proxy_set_header Host libstc.cc.ipns.your-gateway.org;
    }

    # Option 2: Serve requests through your own IPFS instance.
    # location ~ ^/repo/(?<name>[^/]+)/ {
    #   proxy_pass http://127.0.0.1:8080/$name;
    #   proxy_set_header Host repo-libstc-cc.ipns.your-gateway.org;
    # }
  }
}`

const geck_example = `pip install libstc-geck
geck search - hemoglobin`
</script>
