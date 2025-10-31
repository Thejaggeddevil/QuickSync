# ZeroSync API Reference

**For Frontend Integration (Himanshu)**

Base URL: `http://localhost:3001/api`

---

## Endpoints

### 1. Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1698765432000
}
```

---

### 2. Get Status

```http
GET /api/status
```

**Response:**
```json
{
  "status": "running",
  "config": {
    "batchSize": 10,
    "blockTime": 2000,
    "proofInterval": 5
  },
  "stats": {
    "totalBatches": 5,
    "totalProofs": 5,
    "pendingTransactions": 3
  }
}
```

---

### 3. Submit Transaction

```http
POST /api/transactions
Content-Type: application/json
```

**Request Body:**
```json
{
  "from": "0x1234567890abcdef1234567890abcdef12345678",
  "to": "0xabcdef1234567890abcdef1234567890abcdef12",
  "value": 100,
  "data": "0x" // optional
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "a1b2c3d4e5f6...",
    "from": "0x1234...",
    "to": "0xabcd...",
    "value": 100,
    "timestamp": 1698765432000
  },
  "pending": 4
}
```

---

### 4. Get All Batches

```http
GET /api/batches
```

**Response:**
```json
{
  "batches": [
    {
      "id": "batch-123abc",
      "transactions": [...],
      "timestamp": 1698765432000,
      "txCount": 10,
      "stateRoot": "0x7f8a9b...",
      "proofHash": "0x4d5e6f..."
    }
  ]
}
```

---

### 5. Get Batch by ID

```http
GET /api/batches/:id
```

**Response:**
```json
{
  "batch": {
    "id": "batch-123abc",
    "transactions": [
      {
        "id": "tx-1",
        "from": "0x1234...",
        "to": "0xabcd...",
        "value": 100,
        "timestamp": 1698765432000
      }
    ],
    "timestamp": 1698765432000,
    "txCount": 10,
    "stateRoot": "0x7f8a9b...",
    "proofHash": "0x4d5e6f..."
  }
}
```

---

### 6. Get All Proofs

```http
GET /api/proofs
```

**Response:**
```json
{
  "proofs": {
    "batch-123abc": {
      "hash": "0x4d5e6f...",
      "data": {
        "batchId": "batch-123abc",
        "stateRoot": "0x7f8a9b...",
        "txCount": 10,
        "timestamp": 1698765432000
      },
      "type": "mock-zk",
      "valid": true,
      "proof": {
        "pi_a": ["0x...", "0x..."],
        "pi_b": ["0x...", "0x..."],
        "pi_c": ["0x...", "0x..."]
      },
      "publicSignals": ["0x7f8a9b...", "10"]
    }
  }
}
```

---

### 7. Get Proof by Batch ID

```http
GET /api/proofs/:batchId
```

**Response:**
```json
{
  "proof": {
    "hash": "0x4d5e6f...",
    "data": {
      "batchId": "batch-123abc",
      "stateRoot": "0x7f8a9b...",
      "txCount": 10,
      "timestamp": 1698765432000
    },
    "type": "mock-zk",
    "valid": true
  }
}
```

---

### 8. Get Metrics

```http
GET /api/metrics
```

**Response:**
```json
{
  "totalBatches": 5,
  "totalProofs": 5,
  "totalTransactions": 50,
  "pendingTransactions": 3,
  "avgBatchSize": 10.0
}
```

---

### 9. Manual Batch Trigger (Testing)

```http
POST /api/batch/trigger
```

**Response:**
```json
{
  "success": true,
  "batches": 1
}
```

---

## Error Responses

All errors return:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing fields)
- `404` - Not Found
- `500` - Server Error

---

## Frontend Integration Examples

### React/Axios Example

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// Submit transaction
async function submitTransaction(from, to, value) {
  const response = await axios.post(`${API_BASE}/transactions`, {
    from,
    to,
    value
  });
  return response.data;
}

// Get batches
async function getBatches() {
  const response = await axios.get(`${API_BASE}/batches`);
  return response.data.batches;
}

// Get metrics
async function getMetrics() {
  const response = await axios.get(`${API_BASE}/metrics`);
  return response.data;
}
```

### Fetch API Example

```javascript
// Submit transaction
async function submitTransaction(tx) {
  const response = await fetch('http://localhost:3001/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx)
  });
  return await response.json();
}

// Get status
async function getStatus() {
  const response = await fetch('http://localhost:3001/api/status');
  return await response.json();
}
```

---

## Real-Time Updates

Currently, the API uses polling. For real-time updates:

```javascript
// Poll for new batches every 2 seconds
setInterval(async () => {
  const batches = await getBatches();
  updateDashboard(batches);
}, 2000);
```

**Future Enhancement**: WebSocket support for live updates

---

## CORS

The API has CORS enabled for all origins during development. This means you can call it from any frontend (localhost:3000, etc.)

---

## Testing with cURL

### Submit Transaction
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"from":"0x1234","to":"0x5678","value":100}'
```

### Get Status
```bash
curl http://localhost:3001/api/status
```

### Get Metrics
```bash
curl http://localhost:3001/api/metrics
```

---

## Data Flow

1. **User submits transaction** → `POST /api/transactions`
2. **Transaction added to pending pool**
3. **Auto-batcher runs every `blockTime` ms**
4. **Batch created** → visible in `GET /api/batches`
5. **Proof generated** → visible in `GET /api/proofs`
6. **Metrics updated** → visible in `GET /api/metrics`

---

## Dashboard Visualization Ideas

### 1. Transaction Feed
- Real-time list of incoming transactions
- Show: from, to, value, timestamp

### 2. Batch Pipeline
- Animated flow: Tx → Batch → Proof → Anchor
- Show batch progress (X/10 transactions)

### 3. Metrics Panel
- Total transactions processed
- Total batches created
- Total proofs generated
- Average batch size
- Pending transactions count

### 4. Proof Viewer
- List all batches with their proof hashes
- Click to view full proof JSON
- Show state root + proof validity

### 5. Performance Graph
- Line chart: batches over time
- Bar chart: transactions per batch
- Pie chart: gas savings (L1 vs rollup)

---

## Notes for Himanshu

- **Auto-batching**: Transactions are automatically batched every 2 seconds (configurable)
- **Mock Proofs**: Currently generating mock ZK proofs (hash-based)
- **State Storage**: All data persists in `data/` folder as JSON
- **No Auth**: API is open during development
- **CORS Enabled**: Call from any localhost port

---

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Authentication/API keys
- [ ] Rate limiting
- [ ] Pagination for large batch lists
- [ ] Filtering/searching batches
- [ ] Export data (CSV, JSON)

---

**Questions?** Reach out to Manasvi!
