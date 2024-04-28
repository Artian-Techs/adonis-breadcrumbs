export class ParamsParser {
  #params: string[]

  constructor(params: string[]) {
    this.#params = params
  }

  parse() {
    return this.#params.map((param) => this.#parseParam(param))
  }

  /**
   * A param can be one of the following
   *
   * post
   * post?
   * post(slug)
   * >comment
   * >comment(slug)
   */
  #parseParam(param: string) {
    let [name] = param.split('(')

    if (name.startsWith('>')) {
      name = name.substring(1)
    }

    return name
  }
}
