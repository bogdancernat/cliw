var dbUser = 'admin'
  , dbPass = 'admin0'
  , dbHost = (process.env.NODE_ENV == 'production')?'THIS':'127.0.0.1'
  , dbPort = '5984'
  ;

module.exports = {
  'facebookAuth': {
    'id'      : (process.env.NODE_ENV == 'production')?'THIS':'1415950501980661',
    'secret'  : (process.env.NODE_ENV == 'production')?'THIS':'09b3167aed5f4d3eb835791c52fe2a4c',
    'callback': '/auth/facebook/callback',
    'scope'   : ['email']
  },
  'twitterAuth': {
    'key'     : (process.env.NODE_ENV == 'production')?'THIS':'THAT',
    'secret'  : (process.env.NODE_ENV == 'production')?'THIS':'THAT',
    'callback': '/auth/twitter/callback',
    'scope'   : ['email']

  },
  'googleAuth': {
    'id'      : (process.env.NODE_ENV == 'production')?'THIS':'THAT',
    'secret'  : (process.env.NODE_ENV == 'production')?'THIS':'THAT',
    'callback': '/auth/google/callback',
    'scope'   : ['profile','email']
  },
  'db':{
    'dbName': 'cose',
    'dbUrl' : 'http://'+dbUser+':'+dbPass+'@'+dbHost+':'+dbPort,
    'dbHost': dbHost,
    'dbUser': dbUser,
    'dbPass': dbPass,
    'dbPort': dbPort
  }
}