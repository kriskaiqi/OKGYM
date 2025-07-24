import { isUUID } from 'class-validator';
import logger from './logger';

/**
 * Utility class to safely handle ID conversions between string and number
 * This helps manage the dual nature of IDs in the system (numeric IDs and UUIDs)
 */
export class IdConverter {
  /**
   * Safely converts an ID to its most appropriate type
   * @param id The ID to convert (can be string or number)
   * @returns The converted ID in the most appropriate type
   */
  static convertId(id: string | number): string | number {
    // If it's already a number, return as is
    if (typeof id === 'number') {
      return id;
    }

    // If it's a string
    if (typeof id === 'string') {
      // Check if it's a valid UUID
      if (isUUID(id)) {
        return id; // Return the UUID as is
      }

      // Check if it's a numeric string that can be safely converted
      if (/^\d+$/.test(id)) {
        try {
          const numericId = parseInt(id, 10);
          // Verify it's a safe integer
          if (Number.isSafeInteger(numericId)) {
            return numericId;
          }
        } catch (error) {
          logger.warn(`Failed to parse numeric ID string: ${id}`);
        }
      }
    }

    // Return the original ID if all conversions fail
    return id;
  }

  /**
   * Try to match an ID in various formats against a target ID
   * @param sourceId The ID to check (can be string or number)
   * @param targetId The ID to match against (can be string or number)
   * @returns True if the IDs match in any format
   */
  static idMatches(sourceId: string | number, targetId: string | number): boolean {
    // Direct match
    if (sourceId === targetId) {
      return true;
    }

    // Convert both to strings and compare
    if (String(sourceId) === String(targetId)) {
      return true;
    }

    // Convert numeric string to number if possible
    const sourceAsNumber = typeof sourceId === 'string' ? parseInt(sourceId, 10) : sourceId;
    const targetAsNumber = typeof targetId === 'string' ? parseInt(targetId, 10) : targetId;

    // Compare as numbers if both conversions were successful
    if (!isNaN(sourceAsNumber) && !isNaN(targetAsNumber)) {
      return sourceAsNumber === targetAsNumber;
    }

    return false;
  }
} 