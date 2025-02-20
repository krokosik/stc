import {get_label} from "@/translations";

async function get_default_cover() {
  const default_cover = await fetch('./default-cover.jpg')
  const blob = await default_cover.blob()
  return URL.createObjectURL(blob);
}
export const default_cover = await get_default_cover()

export function format_bytes (bytes: number, decimals = 2) {
  if (!+bytes) return '0&nbsp;Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}&nbsp;${sizes[i]}`
}

export function format_date (unixtime: bigint): string {
  const date = new Date(Number.parseInt(unixtime.toString()) * 1000)
  let month = (date.getMonth() + 1).toString()
  if (month.length < 2) {
    month = '0' + month
  }
  let day = date.getDate().toString()
  if (day.length < 2) {
    day = '0' + day
  }
  return `${date.getFullYear()}-${month}-${day}`
}

export function format_percent (v: number): string {
  return (v * 100).toFixed(2) + '%'
}
export const sleep = async (ms: number) => await new Promise((r) => setTimeout(r, ms))

export function generate_filename (title: string) {
  return (
      (title || "unnamed")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, ' ')
      .replace(/\s+/gu, ' ')
      .replace(/\s/gu, '-')
  )
}

export function is_int (s: string) {
  return !isNaN(parseFloat(s))
}

export function average (arr: number[]) {
  if (arr.length === 0) {
    return undefined
  }
  let total = 0
  for (let i = 0; i < arr.length; i++) {
    total += arr[i]
  }
  return total / arr.length
}

export function decode_html(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

export function extract_text_from_html(html: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(html || "", "text/html");
    return document.getElementsByTagName("body")[0].textContent;
}

export function remove_unpaired_escaped_tags(str: string): string {
    const openTags = [];
    const regex = /&lt;\/?([a-z][a-z0-9]*)\b[^&]*&gt;/gi;

    // First pass: Handle and remove unpaired closing tags
    let intermediateStr = str.replace(regex, (match, p1) => {
        if (match.startsWith('&lt;/')) {
            if (openTags.length && openTags[openTags.length - 1] === p1) {
                openTags.pop();
                return match; // Keep the closing tag if it matches the last opening tag
            }
            return ''; // Remove the closing tag if it doesn't match the last opening tag
        } else {
            openTags.push(p1);
            return match; // Keep the opening tag for now
        }
    });

    // Second pass: Remove unpaired opening tags
    for (const tag of openTags) {
        const unpairedTag = new RegExp(`&lt;${tag}\\b[^&]*&gt;`, 'gi');
        intermediateStr = intermediateStr.replace(unpairedTag, '');
    }

    return intermediateStr;
}

export function generate_year_ranges() {
  const ranges = [[undefined, get_label("all_times")]];
  const current_year = new Date().getFullYear();
  for (const shift of [0, 1, 2]) {
    const left_date = new Date(Date.UTC(current_year - shift, 0, 1));
    const right_date = new Date(Date.UTC(current_year - shift + 1, 0, 1));
    ranges.push([[left_date / 1000, right_date / 1000], (current_year - shift).toString()])
  }
  const right_date = new Date(Date.UTC(current_year - 2, 0, 1)) / 1000;
  ranges.push([[0, right_date], "Before " + (current_year - 2).toString()]);
  return ranges;
}

export function remove_markdown (text: string) {
  text = text.replace(/__(.*?)__/g, '$1')
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  text = text.replace(/\|(.*?)(?:\||$)/g, '$1')
  text = text.replace(/\[(.*?)]\(.*?(?:\)|$)/g, '$1')
    text = text.replace(/^#{2,}/g, '')
  return text
}
