class CustomError extends Error {
  /**
   * @type {'server' | 'client'}
   */
  errorIn;

  /**
   * @param {string} rid
   * @param {string} errorName
   * @param {'server' | 'client'} errorIn
   * @param {string} msg
   */
  constructor(rid, errorName, errorIn, msg, originalError) {
    super();

    this.rid = rid;
    this.name = errorName;
    this.errorIn = errorIn;
    this.message = msg;

    if (originalError) {
      this.originalError = originalError;
    }

    // TODO: Metrics submission
  }
}

class ServerError extends CustomError {
  constructor(rid, errorName, msg, originalError) {
    super(rid, errorName, 'server', msg, originalError);
  }
}

class ClientError extends CustomError {
  constructor(rid, errorName, msg, originalError) {
    super(rid, errorName, 'client', msg, originalError);
  }
}

// Unexpected low-level server error from Jenkins (as backend)
class UpperStreamError extends ServerError {
  constructor(rid, msg, originalError, rawResponse) {
    super(rid, 'UpperStreamError', msg, originalError);

    if (rawResponse) {
      this.rawResponse = JSON.stringify(rawResponse);
    }
  }
}

// Invalid Jenkinsfile or unsupported plugin
// TODO (maybe): Distinguish the two on server side
class ParseFailure extends ClientError {
  constructor(rid, msg, parserErrors, userInput) {
    super(rid, 'ParseFailure', msg);
    this.parserErrors = parserErrors;
    this.userInput = userInput.toString();
  }
}

// Mapping function of JFC Core raised an error
class MapperError extends ServerError {
  constructor(rid, msg, originalError, rawInput) {
    super(rid, 'MapperError', msg, originalError);

    if (rawInput) {
      this.rawInput = JSON.stringify(rawInput);
    }
  }
}

module.exports = {
  CustomError,
  ServerError,
  ClientError,
  UpperStreamError,
  ParseFailure,
  MapperError
};
