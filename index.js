import express, {json} from "express";
import sites from "./sites.js";
import docker from "./docker.js";
import * as http from "http";
import config from "./config.js";

const app = express();

function requiredHeaders(attributes) {
    return (req, res, next) => {
        if(!attributes.every((a) => req.header(a))) {
            res.status(400);
            res.send();
        } else {
            next();
        }
    }
}

function requiredData(attributes) {
    return (req, res, next) => {
        if(!attributes.every((a) => Object.keys(req.body).includes(a))) {
            res.status(400);
            res.send();
        } else {
            next();
        }
    }
}

app.use((req, res, next) => {
    // console.log("Incoming!", req.method, req.url, req.headers);
    next();
})

app.get('/', (req, res) => {
    res.status(404);
    res.send("");
})

app.post('/', json(),
    requiredHeaders(['Authorization']),
    requiredData(['image']),
    async (req, res) => {
        console.log("Gotcha!", req.body, req.url);
        const secret = req.header('Authorization');
        if (!sites[secret]) {
            res.status(401);
            res.send();
            return;
        }
        const { domain, validator, labels } = sites[secret] || {};
        if (!domain || !validator) {
            res.status(500);
            res.send("Bad configuration. Missing required values");
            return;
        }
        const { image } = req.body;
        if (!validator.test(image)) {
            res.status(400);
            res.send("Invalid image string");
            return;
        }

        try {
            const runningContainers = await docker.findRunning(domain)
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(docker.createImage(image));
                }, 5000)
            })
            await docker.createContainer({
                Image: image,
                Labels: {
                    'site.deployer.domain': domain,
                    ...(labels || {}),
                }})
                .then(container => {
                    console.log("I created this", container)
                    return docker.start(container.Id)})
                .then(() => {
                    setTimeout(() => {
                        runningContainers
                            .forEach(container => docker.stop(container.Id).then(docker.remove));
                    }, 10000)
                });
            res.status(200);
        } catch (e) {
            res.status(500);
            res.send(e.message);
        }
        res.send();
    });

http.createServer(app).listen(config.get('port'), () => {
    console.log("Started..");
});
