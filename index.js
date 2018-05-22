const fs = require('fs');
const https = require('https');

const options = {
  key: fs.readFileSync('/certs/key.pem'),
  cert: fs.readFileSync('/certs/cert.pem')
};

https.createServer(options, (req, res) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (d) => data += d);
    req.on('end', () => {
        let requestBody = JSON.parse(data);
        let object = requestBody.request.object;

        console.log(object.spec);

        let admissionResponse = {
            allowed: true,
        };

        if (object.spec.storageClassName === 'oci') {
            let val = object.spec.resources.requests.storage;
            let [num, unit] = val.split(/([^\d]+)/);
            let newValue;
            let modifier;

            newValue = +num;

            console.log('old storage', num, unit);

            switch(unit) {
                case "Mi":
                case "mi":
                    modifier = 1 / 1024;
                    break;
                case "Gi":
                case "gi":
                    modifier = 1;
                    break;
                case "Ti":
                case "ti":
                    modifier = 1 * 1024;
                    break;
                default:
                    admissionResponse.allowed = false;
                    admissionResponse.message = 'unknown unit: ' + unit;
                    break;
            }

            newValue *= modifier;

            if (newValue < 50) {
                newValue = 50;
                newValue /= modifier;
                newValue += unit;
                console.log('new storage', newValue);
                admissionResponse.patch = Buffer.from(JSON.stringify([{
                    op: "replace",
                    path: "/spec/resources/requests/storage",
                    value: newValue,
                }])).toString('base64');
            } else {
                console.log('storage meets requirements');
            }
        }

        let admissionReview = {
            response: admissionResponse,
        };

        console.log('admitting', admissionReview);

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(admissionReview));
    });
}).listen(8443);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('SIGHUP', () => process.exit(0));
