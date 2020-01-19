const readline = require('readline-sync')

class Symbol {
	constructor(token) {
		Object.assign(this, { token })
	}
}

class Lambda {
	constructor(params, body, env) {
		Object.assign(this, { params, body, env })
	}
}

class Env {
	constructor(parent) {
		this.parent = parent
		this.values = {}
	}

	create() {
		return new Env(this)
	}

	set(key, value) {
		this.values[key] = value
		return this
	}

	find(key) {
		if (Object.keys(this.values).includes(key)) {
			return this
		}
		if (this.parent) {
			return this.parent.find(key)
		}
		return undefined
	}

	get(key) {
		const env = this.find(key)
		if (env) {
			return env.values[key]
		}
		return undefined
	}
}

const tokensToAST = (tokens) => {
	const token = tokens.shift()
	if (token === '(') {
		const ast = []
		while (tokens[0] !== ')') {
			ast.push(tokensToAST(tokens))
		}
		tokens.shift()
		return ast
	} else if (token.match(/^'$/g)) {
		const ast = []
		ast.push(new Symbol('quote'))
		ast.push(tokensToAST(tokens))
		return ast
	} else if (token.match(/^-?[0-9]+$/g)) {
		return parseInt(token)
	} else if (token.match(/^"(?:\\"|[^"])*"$/g)) {
		return token
			.substr(1, token.length - 2)
			.replace(/\\\\/g, '\\')
			.replace(/\\"/g, '"')
	} else if (token.match(/^(?:true|false)$/g)) {
		return token === 'true'
	} else if (token.match(/^nil$/g)) {
		return null
	} else {
		return new Symbol(token)
	}
}

const astToString = (ast, escaped) => {
	if (Array.isArray(ast)) {
		return `(${ast.map((a) => astToString(a, escaped)).join(' ')})`
	} else if (typeof ast === 'string') {
		if (escaped === true) {
			ast = `"${ast.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
		}
		return ast
	} else if (ast instanceof Symbol) {
		return ast.token
	} else {
		return `${ast}`
	}
}

const read = (str) => {
	return tokensToAST(str.match(/("(?:\\"|[^"])*"|[\(\)']|[^\(\)\s'"]+)/g))
}

const _eval = (ast, env) => {
	while (true) {
		if (Array.isArray(ast)) {
			const [head, ...tail] = ast
			if (head instanceof Symbol) {
				if (head.token === 'quote') {
					return tail[0]
				}
				if (head.token === 'if') {
					let i = 0
					const predicate = eval(tail[0], env)
					if (!predicate) {
						i += 1
					}
					ast = tail[i + 1]
					continue
				}
				if (head.token === 'def!') {
					const key = tail[0]
					const value = eval(tail[1], env)
					env.set(key.token, value)
					return value
				}
				if (head.token === 'do') {
					let index = 0
					while (index < tail.length - 1) {
						eval(tail[index], env)
						index += 1
					}
					if (index === tail.length) {
						return null
					}
					ast = tail[index]
					continue
				}
				if (head.token === 'let*') {
					env = env.create()
					for (let index = 0; index < tail[0].length; index += 2) {
						const key = tail[0][index + 0]
						const value = eval(tail[0][index + 1], env)
						env.set(key.token, value)
					}
					ast = tail[1]
					continue
				}
				if (head.token === 'fn*') {
					const [params, body] = tail
					return new Lambda(params, body, env.create())
				}

				const func = eval(head, env)
				const args = tail.map((e) => eval(e, env))
				if (func instanceof Lambda) {
					for (let index = 0; index < tail.length; index++) {
						const key = func.params[index]
						const value = args[index]
						func.env.set(key.token, value)
					}
					ast = func.body
					env = func.env
					continue
				} else {
					return func.apply(func, args)
				}
			}
		} else if (ast instanceof Symbol) {
			return env.get(ast.token)
		} else {
			return ast
		}
	}
}

let running = true
let debug = false

const eval = (ast, env) => {
	const res = _eval(ast, env)
	if (debug === true) {
		console.log(`${astToString(ast, true)}: ${astToString(res, true)}`)
	}
	return res
}

const prnt = (exp) => {
	if (exp !== undefined) {
		console.log(astToString(exp, true))
	}
	return null
}

const core = Object.assign(require('./core'), {
	debug() {
		debug = !debug
		return undefined
	},
	exit() {
		running = false
		return undefined
	},
	str(...args) {
		return args.map((a) => astToString(a)).join('')
	},
	read(str) {
		return read(str)
	},
	eval(ast) {
		return eval(ast, env)
	},
	print(exp) {
		return prnt(exp)
	},
	require(path) {
		return eval(read(`(eval (read (str "(do " (read-file "${path}") " nil)")))`), env)
	},
})

const env = Object.entries(core).reduce((env, [k, v]) => env.set(k, v), new Env())
eval(read('(require "core.lisp")'), env)
eval(read('(help)'), env)

while (running) {
	const str = readline.question('lisp-node> ')
	if (str !== '') {
		prnt(eval(read(str), env))
	}
}
