const ajv = require("ajv");
const Plugin = require(".");
const Body = require("./body")

class Schema extends Plugin {
  constructor(settings) {
    super();
    this.schemas = ajv();
    this[Plugin.settings](settings);
  }

  add(schema) {
    this.schemas.addSchema(schema);
  }

  remove(schema) {
    this.schemas.deleteSchema(schema);
  }

  check(schema, body) {
    let valid = this.schemas.validate(schema, body);
    return {valid, errors: this.schemas.errors};
  }

  [Plugin.settings]({schemas = []} = {}) {
    for (let schema of schemas)
      this.add(schema);
  }

  [Body.validate](request, next) {
    let {schema} = ((request.router || {}).route || {}).settings || {};
    if (!schema) return next();

    if (!request.body)
      throw "Request body is missing";

    let {valid, errors} = this.check(schema, request.body);
    if (!valid)
      throw `Invalid body: ${errors.map(e => e.message).join("\n")}`;

    return next();
  }
}

module.exports = Schema;