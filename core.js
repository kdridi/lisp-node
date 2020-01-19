const fs = require('fs')

module.exports = {
	help() {
		console.log('Welcome to lisp-node - a super tiny LISP interpreter!')
		console.log('')
		console.log('Here are some examples:')
		console.log('   (sum-to 100): calculate sum of [1..100]')
		console.log('   (fact 10): calculate factorial 100')
		console.log('   (pow 2 10): calculates 2^10')
		console.log('   (debug): toggles debugging information')
		console.log('   (exit): exit lisp-node REPL')
		console.log('')
	},
	'='(a, b) {
		return a === b
	},
	'+'(...[head, ...tail]) {
		return tail.reduce((a, b) => a + b, head)
	},
	'-'(...[head, ...tail]) {
		return tail.reduce((a, b) => a - b, head)
	},
	'*'(...[head, ...tail]) {
		return tail.reduce((a, b) => a * b, head)
	},
	'/'(...[head, ...tail]) {
		return tail.reduce((a, b) => a / b, head)
	},
	'read-file'(path) {
		return fs.readFileSync(path)
	},
}
