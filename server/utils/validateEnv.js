import fs from "fs";
import path from "path";

/**
 * This function checks if an environment variable contains a valid file/folder path.
 * 
 * @param {string} key - name of the environment variable (like "HOME_PATH")
 * @param {Object} options - additional settings
 * @param {boolean} options.mustExist - checks if the actual path exists
 * @returns {string} absolute path to the file/folder
 */
export function validatePathEnv(key, options = {}) {

    // process.env
    const value = process.env[key];

    // check if the value exists at all
    if (!value) {
    throw new Error(`ERROR: ${key} is not set in your .env file. Please add it!`);
    }

    // convert the path to an absolute path
    const absolutePath = path.resolve(value);

    // to verify the path exists on disk
    const shouldCheckExistence = options.mustExist !== false;

    if (shouldCheckExistence) {
    // check if the file or folder actually exists
    const pathExists = fs.existsSync(absolutePath);

    if (!pathExists) {
        throw new Error(`ERROR: The path for ${key} doesn't exist!\nPath: ${absolutePath}\nPlease check if the file or folder is in the right place.`);
    }
    }

    return absolutePath;
}

/**
 * This function checks if any environment variable has a value.
 * 
 * @param {string} key - The name of the environment variable to check
 * @returns {string} The value of the environment variable
 */
export function validateValueEnv(key) {
    // get the value from environment vars
    const value = process.env[key];
    // check if the value exists at all
    if (!value) {
    throw new Error(`ERROR: ${key} is missing from your .env file. Please add a value for it.`);
    }

    return value;
}