# Verification Checker

This module provides utilities to check if users have verified the contract with the verifier contract.

## Available Tools

### 1. Command Line Script

Check verification status from the command line:

```bash
# Check all verification records
bun run check-verification

# Check specific user
bun run check-verification "username"

# Or run directly
bun run src/scripts/checkVerification.ts "username"
```

### 2. React Hooks

Use in your React components:

```typescript
import { useUserVerificationStatus, useAllVerificationRecords } from '@/hooks/useUserVerification';

// Check specific user
const { isVerified, index, author, isLoading, error } = useUserVerificationStatus("username");

// Get all records
const { records, isLoading, error, refetch } = useAllVerificationRecords();
```

### 3. React Component

Ready-to-use component with search and display functionality:

```typescript
import { VerificationChecker } from '@/components/VerificationChecker';

// Use in your app
<VerificationChecker />
```

### 4. Utility Functions

Direct JavaScript/TypeScript functions:

```typescript
import { 
  checkUserVerification, 
  getAllVerificationRecords, 
  checkMultipleUsersVerification 
} from '@/scripts/checkVerification';

// Check single user
const result = await checkUserVerification("username");

// Get all records
const records = await getAllVerificationRecords();

// Check multiple users
const results = await checkMultipleUsersVerification(["user1", "user2"]);
```

## Examples

### CLI Usage

```bash
# Get all verification records
$ bun run check-verification
📋 Getting all verification records...
📋 Index 0: Alice
📋 Index 1: Bob  
📋 Index 2: Charlie
📊 Total verification records found: 3

# Check specific user
$ bun run check-verification "Alice"
🔍 Checking verification for: "Alice"
✅ VERIFIED
📍 Index: 0
👤 Author: Alice
```

### React Hook Usage

```typescript
function VerificationStatus({ username }: { username: string }) {
  const { isVerified, index, author, isLoading } = useUserVerificationStatus(username);

  if (isLoading) return <div>Checking verification...</div>;
  
  return (
    <div>
      {isVerified ? (
        <div>✅ {author} is verified (Index: {index})</div>
      ) : (
        <div>❌ {username} is not verified</div>
      )}
    </div>
  );
}
```

### Utility Function Usage

```typescript
async function checkUser() {
  try {
    const result = await checkUserVerification("Alice");
    
    if (result.isVerified) {
      console.log(`✅ ${result.author} is verified at index ${result.index}`);
    } else {
      console.log(`❌ Alice is not verified`);
    }
  } catch (error) {
    console.error("Error checking verification:", error);
  }
}
```

## How It Works

The verification system works by:

1. **Reading from the blockchain**: Uses the verification contract's `authors` function to read verification records by index
2. **Sequential search**: Iterates through indices starting from 0 until finding a match or reaching the end
3. **Case-insensitive matching**: Compares author names using lowercase comparison
4. **Error handling**: Gracefully handles contract call errors to detect the end of records

## Performance Considerations

- **Default limit**: Searches up to 100 records by default (configurable)
- **Early termination**: Stops when an empty string is returned or an error occurs
- **Caching**: React hooks use proper dependency arrays for efficient re-renders
- **Rate limiting**: Consider blockchain RPC rate limits for large searches

## Contract Details

- **Verification Contract**: `0x9f8f02dab384dddf1591c3366069da3fb0018220`
- **Network**: Sepolia testnet  
- **Function**: `authors(uint256 index) returns (string)`

## Error Handling

The tools handle various error scenarios:

- **Network errors**: Connection issues with the blockchain
- **Contract errors**: Invalid contract calls or missing records  
- **Empty records**: Graceful handling when no verification records exist
- **Invalid inputs**: Validation of user inputs and parameters
