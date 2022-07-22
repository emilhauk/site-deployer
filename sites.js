/**
 * To add a new site, generate a shared secret (eg with `pwgen 64`) and use for key.
 * Add this as a repo secret
 * @type Record<string, {domain: string, tag: string, validator: RegExp}
 */
export default {
    'example_secret_example_secret_example_secret_example_secret_exam': {
        domain: 'example.com',
        validator: /^ghcr\.io\/emilhauk\/example-project/,
        labels: [
            'traefik.http.routers.example.rule=Host(`example.com`)'
        ]
    },
}

