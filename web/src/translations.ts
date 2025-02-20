// @ts-nocheck
export const stamp = 'Nexus - Terra - 20 Feb 25';
const translations = {
  en: {
    about: 'About',
    all_languages: 'All languages',
    all_times: 'All times',
    all_types: 'All types',
    bookmarks: 'bookmarks',
    contacts: 'Contacts',
    donate: 'Donate',
    everywhere: 'Everywhere',
    found: 'found',
    help: 'Help',
    how_to_search: "How to Search?",
    is_ipfs_enabled: 'Is local IPFS daemon enabled?',
    load_more: 'More',
    loading: 'loading',
    loading_document: 'loading document',
    network_error: 'Network error, try to reload page',
    projects: 'Projects',
    report_a_bug: 'Report a bug',
    search: 'Search',
    search_placeholder: 'by title, authors, content, doi...',
    set_up_your_own_replica: 'Set Up Your Own Replica',
    stc_box: 'Build STC Box for Home or Library Use',
    stamp: stamp,
    unsupported_browser: 'Unfortunately, you have unsupported browser. Try to update it or use another browser.',
    welcome: 'Welcome',
    what_to_read: 'What To Read'
  },
}

export function get_label (label: string) {
  for (const language of navigator.languages) {
    const short_language = language.slice(0, 2)
    if (short_language in translations) {
      // @ts-expect-error
      if (label in translations[short_language]) {
        // @ts-expect-error
        return translations[short_language][label]
      } else {
        break
      }
    }
  }
  return translations.en[label]
}
