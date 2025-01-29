/**
 * Validates an array by checking if any of its elements contain false, null, or undefined values
 * @param array The array to validate
 * @returns boolean - true if all properties are valid, false if any property is false, null, or undefined
 */
export const validateArrayProperties = (array: any[]): boolean => {
  if (!Array.isArray(array)) return false;
  
  return !array.some((item) => {
    if (item === null || item === undefined || item === false) {
      return true;
    }

    if (typeof item === 'object') {
      return Object.values(item).some(
        (value) => value === null || value === undefined || value === false
      );
    }

    return false;
  });
};