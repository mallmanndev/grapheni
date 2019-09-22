const functions = require('./functions')
var grapheni = {
    queries: [],
    type: null,
    string: null,
    config: {
        host: null,
        port: null,
        headers: null
    },
    endpoint: false,
    response: {
        response_inteceptor: (response) => response,
        use: function (interceptor) {
            this.response_inteceptor = interceptor
            return this
        }
    },
    create: function (configs) {
        this.config.host = configs.host
        this.config.port = configs.port
        this.config.headers = configs.headers
        return this
    },
    query: function (name) {
        if(this.end){
            this.type = null
            this.queries = []
            this.end = false
        }
        if (this.type == null || this.type == "query") {
            this.type = "query"
            this.queries.push({
                name: name
            })
        } else {
            throw new Error("You cannot create a mutation in a query");
        }
        return this
    },
    mutation: function (name) {
        if(this.end){
            this.type = null
            this.queries = []
            this.end = false
        }
        if (this.type == null || this.type == "mutation") {
            this.type = "mutation"
            this.queries.push({
                name: name
            })
        } else {
            throw new Error("You cannot create a query in a mutation");
        }
        return this
    },
    fields: function (params) {
        this.queries[this.queries.length - 1].params = this.queries[this.queries.length - 1].params ? { ...this.queries[this.queries.length - 1].params, ...params } : params
        return this
    },
    find: (params) => {
        if (this.type == 'query') {
            this.queries[this.queries.length - 1].params = this.queries[this.queries.length - 1].params ? { ...this.queries[this.queries.length - 1].params, ...params } : params
            return this
        } else {
            throw new Error("Method find doesn't work in mutation query!")
        }
    },
    returning: function (fields) {
        this.queries[this.queries.length - 1].return_fields = this.queries[this.queries.length - 1].return_fields ? { ...this.queries[this.queries.length - 1].return_fields, ...fields } : fields
        return this
    },
    toString: function () {
        this.end = true
        return functions.toString(this)
    },
    execute: function () {
        this.end = true
        return functions.execute(this)
    }
}

module.exports = grapheni
