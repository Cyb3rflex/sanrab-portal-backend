import fs from "fs";

// Load your downloaded Firebase JSON
const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf8"));

// Replace real newlines with escaped newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\n/g, "\\n");

// Output as .env variable string
console.log(`FIREBASE_SERVICE_ACCOUNT='${JSON.stringify(serviceAccount)}'`);
