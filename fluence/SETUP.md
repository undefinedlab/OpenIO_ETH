# Fluence SSH Key Setup

## Working Key

The working SSH key for your Fluence VM is:
- **Key File:** `fluence/keys/fluence-ssh-key-1763905419611`
- **Public Key:** `fluence/keys/fluence-ssh-key-1763905419611.pub`

## Public Key (for Fluence Dashboard)

Make sure this public key is added to your Fluence dashboard:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDEOgq5EPKRdC5pHfSuNgM4n5++0J3ELJ0ZtRnzgq1t98hbQ/r6tdP0/TYg0lDiPmuAudadjoqRMlN8u+lcotsJTZxyFcjs1Lmbq/KH+GnWt4k+4Q+Bv/+d6Fa6EqTvLmPKMFkKL6E5NJs+P2HnPY4k0GRtkZaDGxVhlGmYJ3kjgkcZ+7tXt/t0JpE8SJnGmNyi7gc/saFdWGQ6zxs3zYeIL0iOtH3VFRMhJuUfNpX2nWTbylzr0rqmvLyco+zVHst4iGtsg6rJozzUM/Oi1XxMTMAO/KVWGd0yyInUj0jUaIOuC1HmgcMAgS7potGZFDVq32nRlAB2BPSkPyrUPXKx fluence-key
```

## Test Connection

To test the connection:

```bash
cd fluence
node test-connection.js
```

Or manually:

```bash
ssh -i fluence/keys/fluence-ssh-key-1763905419611 ubuntu@81.15.150.156
```

## Environment Variable

You can set the key path in `.env.local`:

```env
FLUENCE_SSH_KEY_PATH=fluence/keys/fluence-ssh-key-1763905419611
```

## VM Information

- **VM ID:** `019ab0f5-2c17-7b53-a36b-2cb73ac5bddc`
- **IPv4:** `81.15.150.156`
- **User:** `ubuntu`
- **Status:** ✅ Connected and working

