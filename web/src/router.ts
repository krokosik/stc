// @ts-nocheck
import { createRouter, createWebHashHistory } from 'vue-router'
import HowToSearchView from "@/pages/how-to-search-view.vue";
import IntroView from "@/pages/intro-view.vue";
import ReplicationView from "@/pages/replication-view.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'search',
      component: () => import('@/pages/search-view.vue'),
      props: (route) => ({
        q: route.query.q,
        p: Number.parseInt(route.query.p),
        t: route.query.t,
        y: route.query.y
      })
    }, {
      path: '/reader',
      name: 'reader',
      component: () => import('@/pages/reader-view.vue'),
      props: (route) => ({
        nexus_key: route.query.nexus_key,
        filename: route.query.filename,
        anchor: route.query.anchor
      })
    }, {
      path: '/help',
      name: 'help',
      component: () => import('@/pages/help-view.vue'),
      children: [
        {
          path: 'intro',
          name: 'intro',
          component: IntroView,
        },
        {
          path: 'how-to-search',
          name: 'how-to-search',
          component: HowToSearchView
        },
        {
          path: 'replication',
          name: 'replication',
          component: ReplicationView
        }
      ]
    },
    {
      path: '/stc/:document_id_query(.+)',
      name: 'document',
      component: () => import('@/pages/document-view.vue'),
      props: true
    }
  ]
})

export default router
