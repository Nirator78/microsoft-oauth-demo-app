const fetch = require("node-fetch")
const express = require('express')
const app = express()
const port = 3000

const clientId = process.argv[2]
const clientSecret = process.argv[3]

app.use(express.static('public'))

app.get('/clientId', (req, res) => {
  res.send(JSON.stringify({ clientId }))
})

app.get('/oauth2callback', handleOAuth2)
async function handleOAuth2(req, res) {
  
  var qs = require('qs');
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: qs.stringify({
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'profile openid email',
        redirect_uri: 'http://localhost:3000/oauth2callback',
        grant_type: 'authorization_code'
      })
    }
  )
  const tokenJson = await tokenResponse.json()
  const userInfo = await getUserInfo(tokenJson.access_token)
  
  res.redirect(`http://localhost:3000?${Object.keys(userInfo).map(key => `${key}=${encodeURIComponent(userInfo[key])}`).join('&')}`)
}

async function getUserInfo(accessToken) {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  const json = await response.json()
  return json
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
