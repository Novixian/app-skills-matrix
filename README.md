# app-skills-matrix

This application is meant to be an automated approach to the skills matrix system that we use here at TES. An application will allow for better scaling and flexibility across the team as it grows.

See [REQUIREMENTS.md](https://github.com/tes/app-skills-matrix/blob/master/REQUIREMENTS.md) for the original requirements.

This tool is now being maintained by the fine folks over at https://www.skillsmap.io.  For more details please visit their site and contact them.

# How to run the app locally
```
λ npm
λ cat .env
MONGO_URL=mongodb://localhost:27017/skillz 
GITHUB_ID=abc123                                        # GitHub Login ID
GITHUB_SECRET=secretlolz                                # GitHub Login secret
DEBUG=skillz:http                                       # Add logs for the requests
JWT_SECRET="not secret lolz"                            # JWT signing secret
HOST=http://localhost:3000                              # Host URL
ENCRYPTION_PASSWORD="also not secret"                   # Used to encrypt the evaluations & actions
MAIL_PROVIDER=ses                                       # mail provider (optional) either ses or mailgun or [empty]
MAIL_DOMAIN=mailgun_domain                              # mail gun domain name (required if MAIL_PROVIDER=mailgun)
MAIL_API_KEY=mailgun_api                                # mail gun api key (required if MAIL_PROVIDER=mailgun)
SES_REGION=ses_region                                   # ses region (required if MAIL_PROVIDER=ses) for ses to work, your host must have access to the AWS api
ADMIN_EMAILS="email@me.com email@you.com"               # email addresses of the admin users (must be JSON!)

λ npm run start-dev
```
All configuration is handled via environment variables (12 factor style), which means deployment on heroku or dokku is easy-peasy.

The default `start-dev` command will start a self reloading nodemon instance. 
 
# How to run tests
```
λ npm
λ cat .env.test
MONGO_URL=mongodb://localhost:27017/skillz-test
GITHUB_ID=MyGithubAppId
GITHUB_SECRET=MySecret
JWT_SECRET=MyJWTSecret
HOST=http://localhost:3000                              
ENCRYPTION_PASSWORD="also not secret"  
ADMIN_EMAILS="dmorgantini@gmail.com"  # required cause of tests ¯\_(ツ)_/¯            
λ npm run test               #To run all the test with fancy coloured output
```
Make sure to use a different database for testing, as tests will clean the database.
