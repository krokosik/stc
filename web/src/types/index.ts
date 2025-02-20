import {format_bytes, generate_filename} from "@/utils.ts";

const default_icon = '📝'
const type_icons: {
    [key: string]: string;
} = {
    'book': '📚',
    'book-chapter': '🔖',
    'chapter': '🔖',
    'dataset': '📊',
    'component': '📊',
    'dissertation': '🧑‍🎓',
    'edited-book': '📚',
    'journal-article': '🔬',
    'monograph': '📚',
    'patent': '📋',
    'peer-review': '🤝',
    'proceedings': '📚',
    'proceedings-article': '🔬',
    'reference-book': '📚',
    'report': '📝',
    'standard': '🛠',
    'wiki': '📙'
}

function get_type_icon(type_name: string | undefined) {
    if (type_name === undefined) {
        return;
    }
    return type_icons[type_name] ?? default_icon
}

export class Highlight {
    from: number;
    to: number;

    constructor(o: Highlight) {
        this.from = o.from
        this.to = o.to
    }
}

export class Snippet {
    html: string;
    fragment: Uint8Array;
    highlights: Highlight[];

    constructor(o: Snippet) {
        this.html = o.html
        this.fragment = o.fragment
        this.highlights = (o.highlights || []).map((highlight) => new Highlight(highlight));
    }
}

export class Snippets {
    abstract?: Snippet
    content?: Snippet
    title?: Snippet

    constructor(o: Snippets) {
        if (o.abstract) {
            this.abstract = new Snippet(o.abstract)
        }
        if (o.content) {
            this.content = new Snippet(o.content)
        }
        if (o.title) {
            this.title = new Snippet(o.title)
        }
    }
}

export class DocumentMetadata {
    publisher: string | undefined;
    issue: string | undefined;
    volume: string | undefined;
    issns: string[] | undefined;
    isbns: string[] | undefined;
    container_title: string | undefined;
    series: string | undefined;

    constructor(o: DocumentMetadata) {
        this.publisher = o.publisher;
        this.issue = o.issue;
        this.volume = o.volume;
        this.issns = o.issns;
        this.isbns = o.isbns;
        this.container_title = o.container_title;
        this.series = o.series;
    }
}

export class Author {
    name: string | undefined
    family: string | undefined
    given: string | undefined
    orcid: string | undefined

    constructor(o: Author) {
        this.name = o.name;
        this.family = o.family;
        this.given = o.given;
        this.orcid = o.orcid;
    }

    format_author() {
        let plain_author = '' as string | undefined;
        if (this.family && this.given) {
            plain_author = this.given + ' ' + this.family
        } else if (this.family || this.given) {
            plain_author = this.family || this.given
        } else if (this.name) {
            plain_author = this.name
        }
        if (plain_author && this.orcid) {
            return `<a href='https://orcid.org/${this.orcid}'>${plain_author}</a>`
        } else {
            return plain_author
        }
    }
}

export class Document {
    id: string
    title: string
    authors: Author[]
    metadata: DocumentMetadata
    issued_at: number | undefined
    tags: string[]
    type: string
    content: string
    abstract: string
    referenced_by_count: number
    languages: string[]
    uris: string[]

    constructor(o: Document | string) {
        if (typeof o === "string") {
            o = JSON.parse(o) as Document;
        }
        this.id = o.id;
        this.title = o.title;
        this.authors = (o.authors || []).map((author) => new Author(author));
        this.metadata = new DocumentMetadata(o.metadata || {})
        this.issued_at = o.issued_at;
        this.tags = o.tags;
        this.type = o.type;
        this.content = o.content;
        this.abstract = o.abstract;
        this.referenced_by_count = o.referenced_by_count;
        this.languages = o.languages;
        this.uris = o.uris;
    }

    dois(): string[] {
        return this.uris.filter((uri) => uri.startsWith("doi:")).map((doi_uri) => doi_uri.substring(4));
    }

    doi(): string | undefined {
        const dois = this.dois();
        if (dois) {
            return dois[0]
        }
    }

    format_authors(): string | undefined {
        if (this.authors) {
            let processed_authors_list = this.authors.slice(0, 3).map((author: Author) => author.format_author()).join(', ')
            if (this.authors.length > 3) {
                processed_authors_list += ' et al'
            }
            return processed_authors_list
        }
        return
    }

    format_date(): string | undefined {
        if (!this.issued_at || this.issued_at === -62135596800) {
            return
        }
        const date = new Date(this.issued_at * 1000)
        if (
            Math.abs(this.issued_at - Math.floor(Date.now() / 1000)) <
            3 * 365 * 24 * 60 * 60
        ) {
            return date.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})
        }
        return date.getFullYear().toString();
    }

    format_coordinates(): string {
        const parts = []
        const authors = this.format_authors();
        if (authors) {
            parts.push(authors)
        }
        const container_title = this.metadata.container_title
        if (container_title) {
            const publisher = this.metadata.publisher
            const series = this.metadata.series
            const issns = this.metadata.issns
            if (publisher) {
                parts.push('by')
                parts.push(`<a class="italic" href='#/?q=metadata.publisher:"${encodeURIComponent(publisher)}"'>${publisher}</a>`)
            }
            if (series) {
                parts.push('of')
                parts.push(`<a class="italic" href='#/?q=metadata.series:"${encodeURIComponent(series)}"&ds=true'>${series}</a>`)
            }
            parts.push('in')
            if (issns) {
                parts.push(`<a class="italic" href='#/?q=metadata.issns:"${encodeURIComponent(issns[0])}"&ds=true'>${container_title}</a>`)
            } else {
                parts.push(`<a class="italic" href='#/?q=metadata.container_title:"${encodeURIComponent(container_title)}"&ds=true'>${container_title}</a>`)
            }
        }
        const volume_or_issue = this.format_volume_or_issue()
        if (volume_or_issue) {
            parts.push(volume_or_issue)
        }
        const date = this.format_date();
        if (date) {
            parts.push('on')
            parts.push(date)
        }
        return parts.join(' ')
    }

    format_volume_or_issue(): string | undefined {
        if (!this.metadata) {
            return
        }
        const issns = this.metadata.issns;
        const issue = this.metadata.issue;
        const volume = this.metadata.volume;
        const with_link = issns && issns?.length > 0
        const filters = []
        let text = ''
        if (volume && issue) {
            text = `vol. ${volume}(${issue})`
        } else {
            if (volume) {
                text = `vol. ${volume}`
            }
            if (issue) {
                text = `iss. ${issue}`
            }
        }
        if (with_link) {
            filters.push(`metadata.issns:%2B"${issns[0]}"`)
            if (volume) {
                filters.push(`metadata.volume:%2B"${volume}"`)
            }
            if (issue) {
                filters.push(`metadata.issue:%2B"${issue}"`)
            }
            return text;
            // return `<a class="text-decoration-none fst-italic" href='#/?q=${filters.join('+')}&ds=true'>${text}</a>`
        } else {
            return text;
        }
    }

    async get_openlibrary_cover() {
        if (this.metadata.isbns && this.metadata.isbns.length > 0) {
            const cover = await fetch('https://covers.openlibrary.org/b/isbn/' + this.metadata.isbns[0] + '-M.jpg')
            if (cover.ok) {
                const blob = await cover.blob()
                if (blob.type.startsWith('image')) {
                    return URL.createObjectURL(blob)
                }
            }
        }
    }

    get_icon() {
        return get_type_icon(this.type)
    }

    extras() {
        const parts = []
        const dois = this.dois()
        if (dois && dois.length > 0) {
            parts.push(
                `<a href="https://doi.org/${dois[0]}" target="_blank">doi:${dois[0]}</a>`
            )
            if (this.referenced_by_count) {
                parts.push(
                    `<a href="#/?q=rd:${dois[0]}&ds=true">🔗 ${this.referenced_by_count}</a>`
                )
            }
        }
        if (this.languages) {
            parts.push(...this.languages)
        }
        parts.push(this.get_icon())
        return parts.join(' | ');
    }
}

export class SearchDocument {
    document: Document
    snippets: Snippets
    score: number

    constructor(o: SearchDocument) {
        this.document = new Document(o.document || {});
        this.snippets = new Snippets(o.snippets);
        this.score = o.score;
    }
}

export class SearchResponse {
    search_documents: SearchDocument[];
    count: number;
    has_next: boolean;

    constructor(o: SearchResponse) {
        this.search_documents = o.search_documents.map((search_document) => new SearchDocument(search_document))
        this.count = o.count;
        this.has_next = o.has_next;
    }

    static empty(): SearchResponse {
        return new SearchResponse({search_documents: [], count: 0, has_next: false})
    }
}


export class Link {
    name: string;
    size: number;

    constructor(o: Link) {
        this.name = o.name;
        this.size = o.size;
    }

    extension(): string {
        return this.name.split(".")[1]
    }

    static get_reader_link(links: Link[]): Link | undefined {
        const weights = {
          "epub": 50,
          "pdf": 40,
          "djvu": 30,
        };
        const sorted_flgs = links.sort(function(a, b){
          const a_weight = weights[a.extension()] || 0;
          const b_weight = weights[b.extension()] || 0;
          return a_weight < b_weight ? 1 : -1;
        })
        if (sorted_flgs.length > 0) {
          return sorted_flgs[0];
        }
    }
}
