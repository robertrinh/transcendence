import { ApiError } from "./errors.js";
export function dbError(error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new ApiError(400, 'Referenced resource does not exist');
    }
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message?.includes('UNIQUE constraint failed')) {
        throw new ApiError(409, 'Resource already exists');
    }
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        throw new ApiError(409, 'Duplicate primary key');
    }
    if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
        throw new ApiError(400, 'Required field is missing');
    }
    if (error.code === 'SQLITE_CONSTRAINT_CHECK') {
        throw new ApiError(400, 'Data validation failed');
    }
    throw error;
}
