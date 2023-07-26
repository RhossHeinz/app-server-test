import { google } from "googleapis";
const playintegrity = google.playintegrity('v1');


const packageName = process.env.PACKAGE_NAME;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');


async function getTokenResponse(token) {

    let jwtClient = new google.auth.JWT(
        clientEmail,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/playintegrity']);

    google.options({ auth: jwtClient });

    const res = await playintegrity.v1.decodeIntegrityToken(
        {
            packageName: packageName,
            requestBody:{
                "integrityToken": token
            }
        }

    );


    console.log(res.data.tokenPayloadExternal);

    return res.data.tokenPayloadExternal
}

module.exports = async (req, res) => {

    const { token = 'none' } = req.query

    if (token == 'none') {
        res.status(400).send({ 'error': 'No token provided' })
        return
    }

    getTokenResponse(token)
        .then(data => {
            res.status(200).send(data)
            return
        })
        .catch(e => {
            console.log(e)
            res.status(200).send({ 'error': 'Google API error.\n' + e.message })
            return
        });
}
