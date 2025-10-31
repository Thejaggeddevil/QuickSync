import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const GUIDES = [
  {
    title: "Getting Started with QuickSync CLI",
    description: "Learn how to initialize and configure your first rollup project",
    content: `# Getting Started with QuickSync CLI

## Installation

\`\`\`bash
npm install -g zerosync
# or
yarn global add zerosync
\`\`\`

## Initialize a Project

\`\`\`bash
zerosync init my-rollup
cd my-rollup
\`\`\`

## Configure Your Rollup

Edit \`zerosync.config.json\`:

\`\`\`json
{
  "rollup": "mock-zk",
  "baseChain": "ethereum",
  "proofEngine": "plonk",
  "batchSize": 32
}
\`\`\`

## Run a Simulation

\`\`\`bash
zerosync simulate
\`\`\`

## Deploy

\`\`\`bash
zerosync deploy --chain sepolia
\`\`\``,
  },
  {
    title: "How ProofEngine Works",
    description: "Understanding the proof generation and verification pipeline",
    content: `# How ProofEngine Works

## Overview

ProofEngine is the core component responsible for:
- Circuit compilation
- Proof generation
- Proof verification
- Constraint satisfaction checking

## Proof Generation Pipeline

### Step 1: Circuit Setup
Compile your circuit definition into constraints.

### Step 2: Witness Generation
Generate witness values for your circuit.

### Step 3: Proof Creation
Execute the prover algorithm to create a cryptographic proof.

### Step 4: Verification
Verify the proof satisfies all circuit constraints.

## Supported Proof Systems

- **PLONK**: General-purpose polynomial commitment scheme
- **GROTH16**: Efficient pairing-based proofs
- **STARK**: Transparent zero-knowledge proofs

## Performance Tips

- Minimize constraint count for faster proving
- Use lookup tables for complex operations
- Batch multiple proofs when possible`,
  },
  {
    title: "Adding Custom Plugins",
    description: "Extend QuickSync with custom rollup implementations",
    content: `# Adding Custom Plugins

## Plugin Structure

\`\`\`
my-plugin/
├── manifest.json
├── index.js
├── circuits/
│   └── main.plonk
└── tests/
    └── test.js
\`\`\`

## Create a Plugin Manifest

\`\`\`json
{
  "name": "my-custom-rollup",
  "version": "1.0.0",
  "description": "Custom rollup implementation",
  "entrypoint": "index.js",
  "compatibility": ["evm", "non-evm"]
}
\`\`\`

## Implement Plugin Logic

\`\`\`javascript
module.exports = {
  async initialize(config) {
    // Setup rollup
  },
  async batch(transactions) {
    // Process transactions
  },
  async generateProof(batch) {
    // Create proof
  }
};
\`\`\`

## Install Custom Plugin

\`\`\`bash
zerosync plugin install ./my-plugin
\`\`\``,
  },
  {
    title: "Running a Local Simulation",
    description: "Test your rollup configuration before deployment",
    content: `# Running a Local Simulation

## Start Simulation

\`\`\`bash
zerosync simulate --local
\`\`\`

## Monitor Progress

The simulation will output:
- Contract deployment events
- Transaction batching progress
- Proof generation metrics
- Finality confirmations

## Analyze Results

View the simulation report:

\`\`\`bash
zerosync report show
\`\`\`

## Export Simulation Data

\`\`\`bash
zerosync report export --format json
zerosync report export --format csv
\`\`\`

## Troubleshooting

### Common Issues

**Issue**: Out of gas
- **Solution**: Increase \`batchSize\` or optimize circuit

**Issue**: Proof verification failed
- **Solution**: Check constraint definitions and witness

**Issue**: Slow prover
- **Solution**: Reduce constraint count or use hardware acceleration`,
  },
];

export default function Docs() {
  const [expandedGuide, setExpandedGuide] = useState(0);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Documentation & Tutorials</h2>
        <p className="text-muted-foreground">
            Guides and tutorials for QuickSync SDK
        </p>
      </div>

      {/* Collapsible Guides */}
      <div className="space-y-3">
        {GUIDES.map((guide, idx) => (
          <Card
            key={idx}
            className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-border/60"
          >
            <button
              onClick={() =>
                setExpandedGuide(expandedGuide === idx ? -1 : idx)
              }
              className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="space-y-1 flex-1">
                <h3 className="font-bold text-lg">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </div>
              <ChevronDown
                size={20}
                className={cn(
                  "text-neon-blue flex-shrink-0 mt-1 transition-transform duration-200",
                  expandedGuide === idx && "rotate-180"
                )}
              />
            </button>

            {expandedGuide === idx && (
              <div className="px-6 pb-6 border-t border-border/30">
                <div className="bg-background/50 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-words">
                    {guide.content}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Key Concepts */}
      <Card className="bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border-neon-blue/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Key Concepts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              term: "Rollup",
              definition: "Layer-2 scaling solution that batches transactions off-chain",
            },
            {
              term: "Proof",
              definition: "Cryptographic evidence that transactions were processed correctly",
            },
            {
              term: "Sequencer",
              definition: "Entity responsible for ordering and batching transactions",
            },
            {
              term: "Finality",
              definition: "Time until a transaction is irreversibly confirmed on L1",
            },
          ].map((concept, idx) => (
            <div key={idx} className="space-y-1">
              <p className="font-semibold text-neon-cyan">{concept.term}</p>
              <p className="text-sm text-muted-foreground">{concept.definition}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">External Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "GitHub Repository",
              url: "https://github.com/zerosync/playground",
              description: "Source code and issue tracker",
            },
            {
              label: "API Documentation",
              url: "https://docs.zerosync.io/api",
              description: "Complete API reference and SDK documentation",
            },
            {
              label: "Community Discord",
              url: "https://discord.gg/zerosync",
              description: "Join our developer community for support",
            },
            {
              label: "Blog & Tutorials",
              url: "https://blog.zerosync.io",
              description: "Latest posts and in-depth tutorials",
            },
          ].map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-secondary/30 rounded-lg border border-border/30 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground group-hover:text-neon-blue transition-colors">
                    {resource.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </div>
                <ExternalLink
                  size={18}
                  className="text-muted-foreground group-hover:text-neon-blue transition-colors flex-shrink-0"
                />
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border-neon-purple/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Get up and running in 5 minutes:</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">1.</span> Install QuickSync CLI
              </li>
              <li>
                <span className="font-semibold text-foreground">2.</span> Initialize a new project
              </li>
              <li>
                <span className="font-semibold text-foreground">3.</span> Configure your rollup
              </li>
              <li>
                <span className="font-semibold text-foreground">4.</span> Run a simulation
              </li>
              <li>
                <span className="font-semibold text-foreground">5.</span> Deploy to testnet
              </li>
            </ol>
          </div>
          <Button className="w-full bg-gradient-to-r from-neon-purple to-neon-blue">
            View Full Quick Start Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
