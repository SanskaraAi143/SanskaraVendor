

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Safely parse JSON data from database responses
 * @param jsonData The JSON data to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns The parsed data or default value
 */
export function parseJsonData<T>(jsonData: Json | null | undefined, defaultValue: T): T {
  if (!jsonData) return defaultValue;

  try {
    if (typeof jsonData === 'object') {
      return jsonData as unknown as T;
    } else if (typeof jsonData === 'string') {
      return JSON.parse(jsonData) as T;
    }
    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON data:', e);
    return defaultValue;
  }
}

/**
 * Prepare data for database by converting to Json compatible format
 * @param data The data to prepare
 * @returns Data formatted for database
 */
export function prepareForDatabase<T>(data: T): Json {
  return data as unknown as Json;
}
