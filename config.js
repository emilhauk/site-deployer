import convict from "convict";

export default convict({
    port: {
        doc: 'Port to listen for requests',
        format: 'port',
        default: 80,
        env: 'PORT',
    },
    dockerUrl: {
        doc: 'Docker API URL. @see https://medium.com/trabe/using-docker-engine-api-securely-584e0882158e',
        format: String,
        default: 'http://127.0.0.1:2375',
        env: 'DOCKER_API_URL',
    },
})
