const fs = require("fs");

const paragraphs = fs.readFileSync("2701-0.txt", { encoding: "utf-8" }).split("\n\n");

function randomParagraph() {
	return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

module.exports = randomParagraph;
