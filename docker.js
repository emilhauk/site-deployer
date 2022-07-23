import fetch from 'node-fetch'
import config from "./config.js";

const DOCKER_VERSION = 'v1.41';
const DOCKER_API_URL = `${config.get('dockerUrl')}/${DOCKER_VERSION}`

export const createImage = (fromImage) => {
    console.log('Creating image', {url: `${DOCKER_API_URL}/images/create?fromSrc=${fromImage}`})
    return fetch(`${DOCKER_API_URL}/images/create?fromSrc=${fromImage}`, {
        method: 'POST',
    })
}

/**
 * @param {string} domain
 * @returns {Promise<Array<{Id: string}>>}
 */
export const findRunning = (domain) => {
    const params = new URLSearchParams({
        filters: JSON.stringify({
            label: [`site.deployer.domain=${domain}`],
        }),
    });
    return fetch(`${DOCKER_API_URL}/containers/json?${params}`)
        .then(res => {
            if(!res.ok) {
                console.log(res)
                return Promise.reject(new Error("Failed..."))
            }
            return res.json();
        });
}

/**
 * @param {string} containerId
 */
export const stop = (containerId) =>
    fetch(`${DOCKER_API_URL}/containers/${containerId}/stop`, {
        method: 'POST',
    }).then(() => containerId);

/**
 * @param {string} containerId
 */
export const remove = (containerId) =>
    fetch(`${DOCKER_API_URL}/containers/${containerId}`, {
        method: 'DELETE',
    }).then(() => containerId);

/**
 * @param config
 * @returns {Promise<{Id: string, Warnings: Array<string>}>}
 */
export const create = async (config) => {
    console.log('Creating container', {url: `${DOCKER_API_URL}/containers/create`, config})
    return fetch(`${DOCKER_API_URL}/containers/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
    }).then(async res => {
        if(!res.ok) {
            console.log(res.status, await res.text())
            throw new Error("Failed to create container")
        }
        const json = await res.json();
        console.log('Create success', json)
        return json;
    });
}

/**
 * @param {string} containerId
 * @returns Promise<string>
 */
export const start = (containerId) => {
    console.log('Starting container', {containerId})
    return fetch(`${DOCKER_API_URL}/containers/${containerId}/start`, {
        method: 'POST',
    })
        .then(async ( res) => {
            if(!res.ok) {
                console.log(res.status, await res.text())
                throw new Error("Failed to start container")
            }
            return containerId
        });
}

export default {
    createImage,
    createContainer: create,
    start,
    findRunning,
    stop,
    remove,
}
