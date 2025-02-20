For better development experience you need `pnpm` installed.

# Run in development mode
```bash
IPFS_URL=http://127.0.0.1:8080 pnpm run dev
```

# Building production

```bash 
bash scripts/build.sh
```

# Deploying to IPFS

```bash 
API_ADDR=/ip4/127.0.0.1/tcp/5001 bash ./scripts/install.sh
```