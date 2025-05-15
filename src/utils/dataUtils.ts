
import { Json } from "@/integrations/supabase/types";

/**
 * Safely parse JSON data from Supabase responses
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
 * Prepare data for Supabase by converting to Json compatible format
 * @param data The data to prepare
 * @returns Data formatted for Supabase
 */
export function prepareForSupabase<T>(data: T): Json {
  return data as unknown as Json;
}
