const http = require("http");

function createReturningFields(fields, level) {
    let string = ""
    fields.map((item, key) => {
        if (typeof item != 'object') {
            string += `\t`
            for (var i = 0; i < level; i++) {
                string += `   `
            }
            string += `${item}`

        } else {
            string += '\t'
            for (var i = 0; i < level; i++) {
                string += `   `
            }
            string += `${Object.keys(item)[0]} {\n`
            string += createReturningFields(item[Object.keys(item)[0]], level + 1)
            string += '\t'
            for (var i = 0; i < level; i++) {
                string += `   `
            }
            string += '}'
        }
        if (key != fields.length - 1) {
            string += `\n`
        }
    })
    return string;
}

function toString(_) {
    let string = `${_.type}{\n`;

    _.queries.map(query => {
        string += `\t${query.name}`;
        if (query.params) {
            string += "(\n"
            Object.keys(query.params).map(item => {
                let value
                if (typeof query.params[item] == 'string') {
                    value = `"${query.params[item]}"`
                } else {
                    value = query.params[item]
                }
                string += `\t   ${item}: ${value}\n`;
            })
            string += `\t)`;
        }

        if (query.return_fields && query.return_fields.length > 0) {
            string += `{\n`;
            string += createReturningFields(query.return_fields, 1)
            string += `\n\t}\n\n`;
        }
    })
    string += `}`
    _.string = string
    return _.string
}

function execute(_) {
    return executeNode(_)
}

function executeNode(_) {
    return new Promise((resolve, reject) => {
        let query = { query: toString(_) }
        let response = ''
        let req = http.request({
            host: _.config.host,
            port: _.config.port,
            method: 'POST',
            headers: _.config.headers
        }, (res) => {
            res.on('data', d => {
                response += d
            })
            res.on('end', () => {
                response = JSON.parse(response)
                if (response.errors) {
                    reject(_.response.response_inteceptor(response))
                } else {
                    resolve(_.response.response_inteceptor(response))
                }
            });
        })

        req.on('error', (error) => {
            reject(error)
        })
        req.write(JSON.stringify(query));
        req.end();
    })
}

module.exports = { createReturningFields, toString, execute }