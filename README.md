# lancer-0-merge-hook
<!-- Hello xHack -->
> A GitHub App built with [Probot](https://github.com/probot/probot) that Activate a smart contract on PR merge

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t lancer-0-merge-hook .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> lancer-0-merge-hook
```

## Contributing

If you have suggestions for how lancer-0-merge-hook could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Jack Sturtevant
