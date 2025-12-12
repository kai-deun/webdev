# NODE dependencies

- npm init (creates package.json)
- npm install \<package\> (node-modules)

- express = framework and routing
- mysql2 = improved mysql
- dotenv = loads environment vars in the .env file
- bcryptjs = hash and compare passwords
- jsonwebtoken = authentication and session (API security)
- cors = cross-origin request (blocks request from diff. domain)
- body-parser = parse incoming request bodies
- helmet = set secure HTTP headers

- npm install --save-dev nodemon (automatic restart or the server)

- npx create-react-app frontend = (Create React App) </br> it's like a ready made template for the frontend

- npm install axios react-router-dom:
    - axios = makes HTTP requests to the APIs
    - react-router-dom = handles routing and navigation

# TREE STRUCTURE

- backend created manually:
- backend:
    - config
    - controllers
    - middleware
    - routes
    - node_modules (dependencies)
    - .env (sensitive info)
    - package.json
    - server.js
- frontend created via npx and npm but some files are created by the dev:
    - node_modules (dependencies)
    - public
    - src
        - App.js
        - services (manual creation)
    - .env
    - package.json

---