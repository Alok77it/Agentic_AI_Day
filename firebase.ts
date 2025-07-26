{
  "emulators": {
    "dataconnect": {
      "dataDir": "dataconnect/.dataconnect/pgliteData",
      "port": 9399
    },
    "apphosting": {
      "port": 5002,
      "rootDirectory": "./",
      "startCommand": "npm run dev"
    },
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "database": {
      "port": 9000
    },
    "hosting": {
      "port": 5000
    },
    "pubsub": {
      "port": 8085
    },
    "storage": {
      "port": 9199
    },
    "eventarc": {
      "port": 9299
    },
    "tasks": {
      "port": 9499
    },
    "ui": {
      "enabled": true
    },
    "singleProjectMode": true
  },
  "dataconnect": {
    "source": "dataconnect"
  },
  "firestore": {
    "database": "(default)",
    "location": "asia-south1",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run lint",
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ]
    },
    {
      "source": "citypulse",
      "codebase": "citypulse",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ],
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run lint"
      ]
    }
  ],
  "apphosting": {
    "backendId": "citypulse",
    "rootDir": "/",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log",
      "functions"
    ]
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "remoteconfig": {
    "template": "remoteconfig.template.json"
  },
  "extensions": {},
  "database": {
    "rules": "database.rules.json"
  }
  // src/firebaseConfig.d.ts
  declare module './firebaseConfig' {
	  export const app: any;
  }
}
