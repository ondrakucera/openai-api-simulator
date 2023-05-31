const express = require("express");
const cors = require("cors");

const { ValidationError, validateAuthorization, validateCompletionsRequest } = require("./validation");
const randomParagraph = require("./paragraph");

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT ?? 8081;

/**
 * @typedef {Object} CompletionsRequest
 * @property {string} model
 * @property {string} prompt
 * @property {number} temperature
 * @property {number} max_tokens
 * @property {number} top_p
 * @property {number} frequency_penalty
 * @property {number} presence_penalty
 * @property {string[]} stop
 */

function CompletionsResponse(model, choiceText) {
	this.id = Math.floor(Math.random() * (2 ** 32 - 1))
		.toString("16")
		.padStart(8, "0");
	this.object = "text_completion";
	this.created = Math.floor(new Date().getTime() / 1000);
	this.model = model;
	this.choices = [{ text: choiceText, index: 0, logprobs: null, finish_reason: "stop" }];
	this.usage = { prompt_tokens: 16, completion_tokens: 53, total_tokens: 69 };
}

app.post("/v1/completions", (request, response) => {
	console.info(`Received a request at ${new Date().toISOString()}`);

	try {
		validateAuthorization(request.header("authorization"));
	} catch (e) {
		if (e.constructor === ValidationError) {
			console.error(e.message);
			response.status(401).send({ message: e.message });
			return;
		}
		throw e;
	}

	/** @type {CompletionsRequest} */
	const completionsRequest = request.body;
	console.info(`Request body:\n${JSON.stringify(completionsRequest, undefined, 4)}`);
	try {
		validateCompletionsRequest(completionsRequest);
	} catch (e) {
		if (e.constructor === ValidationError) {
			console.error(e.message);
			response.status(400).send({ message: e.message });
			return;
		}
		throw e;
	}

	console.info(`Prompt: ${JSON.stringify(completionsRequest.prompt)}`);

	response.send(new CompletionsResponse(completionsRequest.model, randomParagraph()));
});

app.get("/", (request, response) => {
	response.set({ "Content-Type": "text/html" });
	response.send(`<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>OpenAI simulator</title>
	</head>
	<body>
		<h1>OpenAI simulator</h1>
		<p>
			This is a very primitive simulator of https://api.openai.com/v1/completions. It exists to support <a
				href="https://reactgirls.com/">ReactGirls</a> lectures.
		</p>
		<p>
			Nothing else is to be seen here. Instead of GET request (such as this one), you are expected to send a POST
			request to http://localhost:${port}/v1/completions.
		</p>
	</body>
	</html>
	`);
});

// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use((error, request, response, next) => {
	// whatever you want here, feel free to populate
	// properties on `err` to treat it differently in here.
	response.status(error.status || 500);
	response.send({ error: error.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use((request, response) => {
	response.status(404);
	response.send({ error: "Not found." });
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
