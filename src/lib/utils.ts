/**
 * The function capitalizes the first letter of a given string.
 * @param {string} string - The `string` parameter is a string value that you want to capitalize the
 * first letter of.
 * @returns a string with the first letter capitalized.
 *
 * @example
 * import { capitalizeFirstLetter } from '@lib/utils';
 *
 * const capitalizedString = capitalizeFirstLetter('hello world');
 * console.log(capitalizedString); // Hello world
 */
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * The function takes a base URL, a set of arguments, and a page parameter, and returns a stringified
 * URL with the arguments appended as query parameters.
 * @param baseURL - The `baseURL` parameter is a string representing the base URL of the website or API
 * endpoint. It should be a valid URL format, such as "https://example.com" or
 * "https://api.example.com".
 * @param args - An object containing key-value pairs representing the query parameters to be appended
 * to the URL.
 * @param pageParam - The `pageParam` parameter is a string that represents the name of the query
 * parameter used to specify the page number in the URL.
 * @returns a string representation of the URL with the appended query parameters.
 */
export function stringifyURL(baseURL, args = {}) {
  try {
    new URL(baseURL);
  } catch {
    throw new Error('Invalid base URL');
  }

  let url = new URL(baseURL);

  Object.keys(args).forEach((key) => {
    if (args[key] !== null && args[key] !== undefined && args[key] !== '') {
      url.searchParams.append(key, encodeURIComponent(args[key]));
    }
  });

  return url.toString();
}
