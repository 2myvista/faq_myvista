module.exports.handler = async function (event) {
  const auth = event.headers?.Authorization || event.headers?.authorization

  const expected =
    'Basic ' +
    Buffer.from(
      `${process.env.BASIC_USER}:${process.env.BASIC_PASSWORD}`
    ).toString('base64')

  return {
    isAuthorized: auth === expected,
  }
}