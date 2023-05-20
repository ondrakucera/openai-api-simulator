class ValidationError extends Error {
	constructor(message) {
		super(message);
	}
}

/**
 * @param {string | undefined} authorization
 */
function validateAuthorization(authorization) {
	if (!authorization) {
		throw new ValidationError("Expected an authorization HTTP header but there was none");
	}
	if (!authorization.startsWith("Bearer ")) {
		throw new ValidationError(`Expected a Bearer authorization header but it was: ${authorization}`);
	}
}

/**
 * @param {Object} Object
 * @param {string} key
 */
function validateDefined(object, key) {
	const value = object[key];
	if (typeof value === "undefined" || value === null) {
		throw new ValidationError(`Expected '${key}' to exist but it was undefined or null`);
	}
}

/**
 * @param {Object} Object
 * @param {string} key
 */
function validateString(object, key) {
	validateDefined(object, key);
	const value = object[key];
	if (typeof value !== "string") {
		throw new ValidationError(`Expected '${key}' to be a string but it was: ${JSON.stringify(value)}`);
	}
}

/**
 * @param {Object} Object
 * @param {string} key
 */
function validateNumber(object, key) {
	validateDefined(object, key);
	const value = object[key];
	if (typeof value !== "number") {
		throw new ValidationError(`Expected '${key}' to be a number but it was: ${JSON.stringify(value)}`);
	}
}

/**
 * @param {Object} Object
 * @param {string} key
 */
function validateNonEmptyStringArray(object, key) {
	validateDefined(object, key);
	const value = object[key];
	if (!Array.isArray(value) || value.length === 0) {
		throw new ValidationError(`Expected '${key}' to be a non-empty array but it was: ${JSON.stringify(value)}`);
	}
	value.forEach(function (item) {
		if (typeof item !== "string") {
			throw new ValidationError(
				`Expected '${key}' to be an array of strings but there is a non-string in it: ${JSON.stringify(item)}`
			);
		}
	});
}

/**
 * @param {CompletionsRequest} completionsRequest
 */
function validateCompletionsRequest(completionsRequest) {
	validateString(completionsRequest, "model");
	validateString(completionsRequest, "prompt");
	validateNumber(completionsRequest, "temperature");
	validateNumber(completionsRequest, "max_tokens");
	validateNumber(completionsRequest, "top_p");
	validateNumber(completionsRequest, "frequency_penalty");
	validateNumber(completionsRequest, "presence_penalty");
	validateNonEmptyStringArray(completionsRequest, "stop");
}

module.exports = {
	ValidationError,
	validateAuthorization,
	validateCompletionsRequest,
};
